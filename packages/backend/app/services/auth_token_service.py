"""Refresh-token persistence and access/refresh token issuance."""

import hashlib

from fastapi import HTTPException, status
from redis.asyncio import Redis

from app.api_models.auth import TokenResponse
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.db_schemas.user import User

REFRESH_TTL_SECONDS = settings.JWT_REFRESH_TTL_DAYS * 86_400


def token_key(raw_token: str) -> str:
    """Return the Redis key for a refresh token without storing the raw token."""
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return f"refresh:{token_hash}"


def _refresh_value(user: User) -> str:
    return f"{user.id}:{user.token_version}"


def _parse_refresh_value(value: str) -> tuple[str, int]:
    if ":" not in value:
        return value, 0
    user_id, raw_version = value.rsplit(":", 1)
    try:
        return user_id, int(raw_version)
    except ValueError:
        return "", -1


async def issue_tokens(user: User, redis: Redis) -> TokenResponse:
    access_token = create_access_token(
        str(user.id),
        user.system_role.value,
        user.token_version,
        user.must_change_password,
    )
    refresh_token = create_refresh_token()
    await redis.set(
        token_key(refresh_token),
        _refresh_value(user),
        ex=REFRESH_TTL_SECONDS,
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


async def rotate_tokens(refresh_token: str, redis: Redis) -> TokenResponse:
    key = token_key(refresh_token)
    stored_value = await redis.get(key)
    if stored_value is None:
        raise _invalid_refresh_token()

    user_id, token_version = _parse_refresh_value(stored_value)
    user = await User.get(user_id)
    if user is None or token_version != user.token_version:
        await redis.delete(key)
        raise _invalid_refresh_token()

    await redis.delete(key)
    return await issue_tokens(user, redis)


async def revoke_token(refresh_token: str, redis: Redis) -> None:
    await redis.delete(token_key(refresh_token))


def _invalid_refresh_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )
