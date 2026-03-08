"""Shared fixtures for auth and admin integration tests.

All fixtures are module-scoped so each test module gets its own HTTP client
that triggers the FastAPI lifespan (init_db → seed_first_admin). Tokens are
fetched once per module and reused across tests in that module.
"""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.user import User


@pytest_asyncio.fixture(scope="module")
async def client():
    """Module-scoped async HTTP test client.

    Using AsyncClient as a context manager triggers the FastAPI lifespan,
    which initialises MongoDB (Beanie) and seeds the first admin user.
    Requires MONGO_URI and REDIS_URL to be set in the environment.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture(scope="module")
async def admin_tokens(client: AsyncClient) -> dict:
    """Login as the seeded first admin. Returns the full token response dict.

    Shape: {"access_token": str, "refresh_token": str, "token_type": "bearer"}
    """
    resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": settings.FIRST_ADMIN_EMAIL,
            "password": settings.FIRST_ADMIN_PASSWORD,
        },
    )
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()


@pytest_asyncio.fixture(scope="module")
async def regular_user_token() -> str:
    """Create a temporary regular user and return their access token.

    The user is inserted directly into the DB (bypassing the invite flow)
    so that non-admin / non-authenticated scenarios can be tested without
    standing up the full invite acceptance flow.

    Yields the Bearer token string. The user is deleted after the module.
    """
    user = User(
        email="test-regular-user@example.com",
        full_name="Test Regular User",
        hashed_password=hash_password("TestPassword123!"),
    )
    await user.insert()
    token = create_access_token(str(user.id), "user")
    yield token
    await user.delete()
