"""Shared fixtures for auth and admin integration tests.

All fixtures are module-scoped so each test module gets its own HTTP client
that triggers the FastAPI lifespan (init_db → seed_first_admin). Tokens are
fetched once per module and reused across tests in that module.
"""

import pytest_asyncio
from httpx import AsyncClient
import pytest
import subprocess
import time
import httpx
import logging

import motor.motor_asyncio

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.user import User

logger = logging.getLogger(__name__)


@pytest.fixture(scope="session", autouse=True)
def start_server():
    """Start the real FastAPI server."""
    logger.info("🚀 Starting server...")
    
    process = subprocess.Popen(
        ["uvicorn", "app.main:app", "--port", "8000"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    
    # Wait for server to be ready
    for attempt in range(30):
        try:
            httpx.get("http://127.0.0.1:8000/docs")
            logger.info("✓ Server is ready!")
            break
        except httpx.ConnectError:
            if attempt == 29:
                process.terminate()
                raise RuntimeError("Server failed to start")
            time.sleep(1)
    
    yield process
    
    logger.info("🛑 Stopping server...")
    process.terminate()
    process.wait(timeout=5)

@pytest_asyncio.fixture(scope="module")
async def client():
    """HTTP client pointing to the running server."""
    async with httpx.AsyncClient(
        base_url="http://127.0.0.1:8000",
        timeout=10.0,
    ) as ac:
        yield ac



@pytest_asyncio.fixture(scope="module")
async def admin_tokens(client: AsyncClient) -> dict:
    """Login as the seeded first admin. Returns the full token response dict.

    Shape: {"access_token": str, "refresh_token": str, "token_type": "bearer"}
    """
    logger.debug("Logging in as admin")
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
    logger.debug("Creating regular user")
    user = User(
        email="test-regular-user@example.com",
        full_name="Test Regular User",
        hashed_password=hash_password("TestPassword123!"),
    )
    await user.insert()
    token = create_access_token(str(user.id), "user")
    yield token
    await user.delete()
