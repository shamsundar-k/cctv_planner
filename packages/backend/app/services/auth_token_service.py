"""Refresh-token persistence and access/refresh token issuance."""

import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status

from app.api_models.auth import TokenResponse
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.db_schemas.user import User
from app.models.refresh_token import RefreshToken

REFRESH_TTL_SECONDS = settings.JWT_REFRESH_TTL_DAYS * 86_400


def token_hash(raw_token: str) -> str:
    """Hash a refresh token so its raw value is never persisted."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


async def issue_tokens(user: User) -> TokenResponse:
    access_token = create_access_token(
        str(user.id),
        user.system_role.value,
        user.token_version,
        user.must_change_password,
    )
    refresh_token = create_refresh_token()
    now = datetime.now(UTC)
    session = RefreshToken(
        token_hash=token_hash(refresh_token),
        user_id=user.id,
        token_version=user.token_version,
        expires_at=now + timedelta(seconds=REFRESH_TTL_SECONDS),
    )
    await session.insert()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


async def rotate_tokens(refresh_token: str) -> TokenResponse:
    """Atomically consume a refresh token and issue its single replacement."""
    session = await RefreshToken.get_pymongo_collection().find_one_and_delete(
        {"token_hash": token_hash(refresh_token)}
    )
    if session is None:
        raise _invalid_refresh_token()

    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at <= datetime.now(UTC):
        raise _invalid_refresh_token()

    user = await User.get(session["user_id"])
    if user is None or session["token_version"] != user.token_version:
        raise _invalid_refresh_token()

    return await issue_tokens(user)


async def revoke_token(refresh_token: str) -> None:
    await RefreshToken.get_pymongo_collection().delete_one(
        {"token_hash": token_hash(refresh_token)}
    )


def _invalid_refresh_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )
