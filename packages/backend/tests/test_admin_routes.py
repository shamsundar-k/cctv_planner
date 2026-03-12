"""Integration tests for admin routes.

Endpoints covered
-----------------
POST /api/v1/admin/invite   — generate invite link (admin only)
GET  /api/v1/admin/users    — list all system users (admin only)

Token-saving pattern
--------------------
The `admin_tokens` module fixture (from conftest.py) logs in once and makes
the access / refresh tokens available to every test in this module.
The `TestInviteGeneration` class stores the invite URL in a class variable so
that duplicate-invite and other sequential assertions can reference it.
"""

import motor.motor_asyncio
import pytest_asyncio
from httpx import AsyncClient

from app.core.config import settings

# Email address used throughout invite generation tests.
# Must not already have a pending invite when the test suite starts.
_INVITE_EMAIL = "test-admin-invite@example.com"


# ---------------------------------------------------------------------------
# Module fixture — cleanup any leftover invite for _INVITE_EMAIL
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture(scope="module", autouse=True)
async def cleanup_invite():
    """Remove invite documents for _INVITE_EMAIL before and after the module.

    Uses raw Motor operations because Beanie is not initialised in the test
    process (init_beanie only runs inside the Uvicorn child process).

    The pre-run cleanup guards against stale data from a previous failed run.
    """
    motor_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
    db = motor_client.get_default_database()
    col = db["invite_tokens"]

    # Pre-run cleanup
    await col.delete_many({"email": _INVITE_EMAIL})

    yield

    # Post-run cleanup
    await col.delete_many({"email": _INVITE_EMAIL})
    motor_client.close()


# ---------------------------------------------------------------------------
# Invite generation tests
# ---------------------------------------------------------------------------


class TestInviteGeneration:
    """POST /api/v1/admin/invite"""

    # Class-level store populated by the first test for later assertions
    _invite_url: str = ""
    _raw_token: str = ""

    async def test_create_invite_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": _INVITE_EMAIL},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "invite_url" in data
        assert "expires_at" in data
        assert "/accept-invite?token=" in data["invite_url"]

        # Save for later tests in this class
        TestInviteGeneration._invite_url = data["invite_url"]
        TestInviteGeneration._raw_token = data["invite_url"].split("token=")[1]

    async def test_create_duplicate_invite_returns_conflict(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """A second pending invite for the same email must return 409."""
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": _INVITE_EMAIL},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 409
        assert "pending invite" in resp.json()["detail"].lower()

    async def test_invite_url_contains_token(self):
        """Sanity-check the saved invite URL structure."""
        assert TestInviteGeneration._invite_url, "test_create_invite_success must run first"
        assert "token=" in TestInviteGeneration._invite_url
        # Raw token should be non-empty
        assert TestInviteGeneration._raw_token

    async def test_create_invite_no_auth(self, client: AsyncClient):
        """Request without Authorization header must be rejected."""
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": "noauth@example.com"},
            # no Authorization header
        )
        # HTTPBearer returns 403 when credentials are absent
        assert resp.status_code == 401

    async def test_create_invite_non_admin(
        self, client: AsyncClient, regular_user_token: str
    ):
        """A regular (non-admin) user must receive 403."""
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": "nonadmin@example.com"},
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 403
        assert "admin" in resp.json()["detail"].lower()

    async def test_create_invite_invalid_email(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Malformed email should be rejected with 422."""
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": "not-an-email"},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_invite_with_expired_access_token(self, client: AsyncClient):
        """An obviously invalid (expired/fake) JWT must return 401."""
        fake_jwt = "eyJhbGciOiJIUzI1NiJ9.e30.fake-signature"
        resp = await client.post(
            "/api/v1/admin/invite",
            json={"email": "jwt-expired@example.com"},
            headers={"Authorization": f"Bearer {fake_jwt}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# List users tests
# ---------------------------------------------------------------------------


class TestListUsers:
    """GET /api/v1/admin/users"""

    async def test_list_users_returns_array(
        self, client: AsyncClient, admin_tokens: dict
    ):
        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        users = resp.json()
        assert isinstance(users, list)
        assert len(users) >= 1  # At least the seeded admin exists

    async def test_list_users_contains_admin(
        self, client: AsyncClient, admin_tokens: dict
    ):
        from app.core.config import settings

        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        emails = [u["email"] for u in resp.json()]
        assert settings.FIRST_ADMIN_EMAIL in emails

    async def test_list_users_response_shape(
        self, client: AsyncClient, admin_tokens: dict
    ):
        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        for user in resp.json():
            assert "id" in user
            assert "email" in user
            assert "full_name" in user
            assert "system_role" in user
            assert "created_at" in user

    async def test_list_users_no_auth(self, client: AsyncClient):
        """Request without Authorization header must be rejected."""
        resp = await client.get("/api/v1/admin/users")
        assert resp.status_code == 401

    async def test_list_users_non_admin(
        self, client: AsyncClient, regular_user_token: str
    ):
        """A regular (non-admin) user must receive 403."""
        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 403
        assert "admin" in resp.json()["detail"].lower()

    async def test_list_users_invalid_token(self, client: AsyncClient):
        fake_jwt = "eyJhbGciOiJIUzI1NiJ9.e30.fake-signature"
        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {fake_jwt}"},
        )
        assert resp.status_code == 401
