"""Auth router: login (issue JWT + refresh token), refresh (rotate refresh token), logout (revoke refresh token), and invite acceptance."""

import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from redis.asyncio import Redis

from app.core.database import get_redis
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.models.invite_token import InviteToken
from app.models.user import User
from app.schemas.auth import (
    AcceptInvitePreview,
    AcceptInviteRequest,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

_REFRESH_TTL = settings.JWT_REFRESH_TTL_DAYS * 86_400  # seconds


def _token_key(raw_token: str) -> str:
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return f"refresh:{token_hash}"


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, redis: Redis = Depends(get_redis)) -> TokenResponse:
    user = await User.find_one(User.email == body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(str(user.id), user.system_role.value)
    refresh_token = create_refresh_token()
    await redis.set(_token_key(refresh_token), str(user.id), ex=_REFRESH_TTL)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, redis: Redis = Depends(get_redis)) -> TokenResponse:
    key = _token_key(body.refresh_token)
    user_id = await redis.get(key)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = await User.get(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Rotate: revoke old token, issue new pair
    await redis.delete(key)
    access_token = create_access_token(str(user.id), user.system_role.value)
    new_refresh_token = create_refresh_token()
    await redis.set(_token_key(new_refresh_token), str(user.id), ex=_REFRESH_TTL)

    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    redis: Redis = Depends(get_redis),
    _: User = Depends(get_current_user),
) -> None:
    await redis.delete(_token_key(body.refresh_token))


@router.get("/accept-invite", response_model=AcceptInvitePreview)
async def preview_invite(token: str = Query(...)) -> AcceptInvitePreview:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite is None or invite.used or invite.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")
    return AcceptInvitePreview(email=invite.email, expires_at=invite.expires_at)


@router.post("/accept-invite", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def accept_invite(
    body: AcceptInviteRequest,
    redis: Redis = Depends(get_redis),
) -> TokenResponse:
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite is None or invite.used or invite.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")

    existing = await User.find_one(User.email == invite.email)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=invite.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
    )
    await user.insert()

    invite.used = True
    await invite.save()

    access_token = create_access_token(str(user.id), user.system_role.value)
    refresh_token = create_refresh_token()
    await redis.set(_token_key(refresh_token), str(user.id), ex=_REFRESH_TTL)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
