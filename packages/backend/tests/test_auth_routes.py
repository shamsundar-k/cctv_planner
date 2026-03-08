"""Integration tests for auth routes.

Endpoints covered
-----------------
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/accept-invite  (preview)
POST /api/v1/auth/accept-invite  (register via invite)

Token-saving pattern
--------------------
Each test class stores tokens in class-level variables so later tests within
the same class can pick them up without re-authenticating. Tests are defined
in execution order to make the flow explicit.
"""

import hashlib

import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.core.config import settings
from app.models.invite_token import InviteToken
from app.models.user import User

# ---------------------------------------------------------------------------
# Invite-accept fixture — scoped to module so it is shared across the class
# ---------------------------------------------------------------------------

_INVITE_ACCEPT_EMAIL = "test-accept-invite@example.com"


@pytest_asyncio.fixture(scope="module")
async def invite_for_accept(client: AsyncClient, admin_tokens: dict) -> dict:
    """Create one invite for the accept-invite flow tests.

    Yields {"email": str, "raw_token": str, "invite_url": str}.
    Cleans up the invite document and any registered user after the module.
    """
    resp = await client.post(
        "/api/v1/admin/invite",
        json={"email": _INVITE_ACCEPT_EMAIL},
        headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
    )
    assert resp.status_code == 201, f"Invite creation failed: {resp.text}"
    data = resp.json()
    invite_url: str = data["invite_url"]
    raw_token = invite_url.split("token=")[1]

    yield {"email": _INVITE_ACCEPT_EMAIL, "raw_token": raw_token, "invite_url": invite_url}

    # Teardown — remove invite and any user created during tests
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite:
        await invite.delete()
    user = await User.find_one(User.email == _INVITE_ACCEPT_EMAIL)
    if user:
        await user.delete()


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------


class TestLogin:
    """POST /api/v1/auth/login"""

    # Class-level store — populated by test_login_success for later classes
    _tokens: dict = {}

    async def test_login_success(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": settings.FIRST_ADMIN_EMAIL,
                "password": settings.FIRST_ADMIN_PASSWORD,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        # Save for downstream test classes
        TestLogin._tokens = data

    async def test_login_wrong_password(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": settings.FIRST_ADMIN_EMAIL, "password": "wrong-password"},
        )
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Invalid email or password"

    async def test_login_unknown_email(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@example.com", "password": "whatever"},
        )
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Invalid email or password"

    async def test_login_missing_fields(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422  # Pydantic validation error


# ---------------------------------------------------------------------------
# Token refresh tests
# ---------------------------------------------------------------------------


class TestTokenRefresh:
    """POST /api/v1/auth/refresh

    Depends on TestLogin._tokens being populated first.
    """

    # Class-level stores for the pre-refresh and post-refresh token sets
    _initial_tokens: dict = {}
    _rotated_tokens: dict = {}

    async def test_01_setup_fresh_login(self, client: AsyncClient):
        """Acquire a fresh pair of tokens specifically for the refresh flow."""
        resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": settings.FIRST_ADMIN_EMAIL,
                "password": settings.FIRST_ADMIN_PASSWORD,
            },
        )
        assert resp.status_code == 200
        TestTokenRefresh._initial_tokens = resp.json()

    async def test_02_refresh_returns_new_tokens(self, client: AsyncClient):
        tokens = TestTokenRefresh._initial_tokens
        assert tokens, "test_01 must run first"

        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        # Tokens should be rotated (different from originals)
        assert data["refresh_token"] != tokens["refresh_token"]
        TestTokenRefresh._rotated_tokens = data

    async def test_03_old_refresh_token_is_revoked(self, client: AsyncClient):
        """After rotation the original refresh token must be rejected (replay protection)."""
        old_refresh = TestTokenRefresh._initial_tokens["refresh_token"]
        assert old_refresh, "test_01 must run first"

        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": old_refresh},
        )
        assert resp.status_code == 401
        assert "refresh token" in resp.json()["detail"].lower()

    async def test_04_rotated_token_is_still_valid(self, client: AsyncClient):
        """The newly issued refresh token from rotation must work for another refresh."""
        rotated = TestTokenRefresh._rotated_tokens
        assert rotated, "test_02 must run first"

        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": rotated["refresh_token"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        # Update stored tokens with latest pair
        TestTokenRefresh._rotated_tokens = data

    async def test_refresh_with_invalid_token(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "totally-invalid-token"},
        )
        assert resp.status_code == 401

    async def test_refresh_missing_body(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/refresh", json={})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Logout tests
# ---------------------------------------------------------------------------


class TestLogout:
    """POST /api/v1/auth/logout

    Performs a dedicated fresh login so it doesn't disturb the token state
    that other test classes depend on.
    """

    async def test_logout_success(self, client: AsyncClient):
        # Fresh login for this test
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": settings.FIRST_ADMIN_EMAIL,
                "password": settings.FIRST_ADMIN_PASSWORD,
            },
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()

        resp = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": tokens["refresh_token"]},
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code == 204
        assert resp.content == b""  # no body on 204

    async def test_logout_refresh_token_invalidated_after_logout(self, client: AsyncClient):
        """After logout the refresh token must no longer work."""
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": settings.FIRST_ADMIN_EMAIL,
                "password": settings.FIRST_ADMIN_PASSWORD,
            },
        )
        tokens = login_resp.json()

        # Logout
        await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": tokens["refresh_token"]},
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )

        # Refresh must now fail
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert resp.status_code == 401

    async def test_logout_requires_bearer_auth(self, client: AsyncClient):
        """Logout without an Authorization header must be rejected."""
        resp = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": "some-token"},
            # no Authorization header
        )
        # HTTPBearer returns 403 when no credentials are provided
        assert resp.status_code == 403

    async def test_logout_with_invalid_access_token(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": "some-token"},
            headers={"Authorization": "Bearer not-a-valid-jwt"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Accept-invite tests (preview + register)
# ---------------------------------------------------------------------------


class TestInviteAcceptFlow:
    """GET/POST /api/v1/auth/accept-invite

    Uses the `invite_for_accept` module fixture which creates one invite and
    tears it down (along with any registered user) after the module finishes.

    Registered-user tokens are stored in a class variable so the
    'already used' test can confirm the token is spent.
    """

    _new_user_tokens: dict = {}

    async def test_preview_invite_valid_token(
        self, client: AsyncClient, invite_for_accept: dict
    ):
        resp = await client.get(
            "/api/v1/auth/accept-invite",
            params={"token": invite_for_accept["raw_token"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == invite_for_accept["email"]
        assert "expires_at" in data

    async def test_preview_invite_invalid_token(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/auth/accept-invite",
            params={"token": "completely-invalid-token"},
        )
        assert resp.status_code == 400
        assert "invalid" in resp.json()["detail"].lower()

    async def test_accept_invite_registers_user_and_returns_tokens(
        self, client: AsyncClient, invite_for_accept: dict
    ):
        resp = await client.post(
            "/api/v1/auth/accept-invite",
            json={
                "token": invite_for_accept["raw_token"],
                "full_name": "Invited Test User",
                "password": "SecurePassword123!",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        # Save for subsequent test
        TestInviteAcceptFlow._new_user_tokens = data

    async def test_accept_invite_token_already_used(
        self, client: AsyncClient, invite_for_accept: dict
    ):
        """Reusing a spent invite token must be rejected."""
        resp = await client.post(
            "/api/v1/auth/accept-invite",
            json={
                "token": invite_for_accept["raw_token"],
                "full_name": "Duplicate User",
                "password": "AnotherPassword123!",
            },
        )
        assert resp.status_code == 400
        assert "invalid" in resp.json()["detail"].lower()

    async def test_new_user_tokens_are_usable(
        self, client: AsyncClient, invite_for_accept: dict
    ):
        """Tokens returned from accept-invite must work for authenticated endpoints."""
        tokens = TestInviteAcceptFlow._new_user_tokens
        assert tokens, "test_accept_invite_registers_user_and_returns_tokens must run first"

        # Refresh works → the new user is properly in DB and Redis
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert resp.status_code == 200
