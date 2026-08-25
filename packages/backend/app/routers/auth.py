"""Auth router: login (issue JWT + refresh token), refresh (rotate refresh token), logout (revoke refresh token), and invite acceptance."""

import hashlib
from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from redis.asyncio import Redis

from app.core.database import get_redis
from app.core.deps import get_authenticated_user
from app.core.security import (
    DEFAULT_RESET_PASSWORD,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.models.invite_token import InviteToken
from app.models.password_reset_request import (
    PasswordResetRequest as PasswordResetRequestDocument,
    PasswordResetStatus,
)
from app.api_models.auth import (
    AcceptInvitePreview,
    AcceptInviteRequest,
    LoginRequest,
    MessageResponse,
    PasswordChangeRequest,
    PasswordResetRequestCreate,
    RefreshRequest,
    TokenResponse,
)
from app.api_models.user import UserCreate
from app.db_schemas.user import User


router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)
_REFRESH_TTL = settings.JWT_REFRESH_TTL_DAYS * 86_400  # seconds
_RESET_REQUEST_MESSAGE = (
    "If an account exists for that email, its password reset request has been sent."
)


def _token_key(raw_token: str) -> str:
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


async def _issue_tokens(user: User, redis: Redis) -> TokenResponse:
    access_token = create_access_token(
        str(user.id),
        user.system_role.value,
        user.token_version,
        user.must_change_password,
    )
    refresh_token = create_refresh_token()
    await redis.set(
        _token_key(refresh_token),
        _refresh_value(user),
        ex=_REFRESH_TTL,
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, redis: Redis = Depends(get_redis)) -> TokenResponse:
    logger.info("Login attempt: email=%s", body.email)
    
    user = await User.find_one(User.email == body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return await _issue_tokens(user, redis)


@router.post(
    "/password-reset-requests",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_password_reset_request(
    body: PasswordResetRequestCreate,
) -> MessageResponse:
    user = await User.find_one({"email": str(body.email)})
    if user is not None:
        existing = await PasswordResetRequestDocument.find_one(
            {
                "user_id": user.id,
                "status": PasswordResetStatus.pending.value,
            }
        )
        if existing is None:
            request = PasswordResetRequestDocument(
                user_id=user.id,
                email=user.email,
            )
            await request.insert()
    return MessageResponse(message=_RESET_REQUEST_MESSAGE)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, redis: Redis = Depends(get_redis)) -> TokenResponse:
    logger.info("Refresh attempt")
    key = _token_key(body.refresh_token)
    stored_value = await redis.get(key)
    if stored_value is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id, token_version = _parse_refresh_value(stored_value)
    user = await User.get(user_id)
    if user is None or token_version != user.token_version:
        await redis.delete(key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Rotate: revoke old token, issue new pair
    await redis.delete(key)
    return await _issue_tokens(user, redis)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    redis: Redis = Depends(get_redis),
    _: User = Depends(get_authenticated_user),
) -> None:
    logger.info("Logout attempt: user_id=%s", _.id)
    await redis.delete(_token_key(body.refresh_token))


@router.post("/change-password", response_model=TokenResponse)
async def change_password(
    body: PasswordChangeRequest,
    redis: Redis = Depends(get_redis),
    user: User = Depends(get_authenticated_user),
) -> TokenResponse:
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if body.new_password == DEFAULT_RESET_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose a password other than the temporary password",
        )
    if body.new_password == body.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    user.hashed_password = hash_password(body.new_password)
    user.must_change_password = False
    user.token_version += 1
    await user.save()
    return await _issue_tokens(user, redis)


@router.get("/accept-invite", response_model=AcceptInvitePreview)
async def preview_invite(token: str = Query(...)) -> AcceptInvitePreview:
    logger.info(f"Preview invite attempt: token={token}")   
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    logger.info(f"Computed invite token hash: {token_hash}")
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite is None or invite.used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")
    expires_at = invite.expires_at if invite.expires_at.tzinfo is not None else invite.expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")
    return AcceptInvitePreview(email=invite.email, expires_at=invite.expires_at)


@router.post("/accept-invite", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def accept_invite(
    body: AcceptInviteRequest,
    redis: Redis = Depends(get_redis),
) -> TokenResponse:
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite is None or invite.used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")
    expires_at = invite.expires_at if invite.expires_at.tzinfo is not None else invite.expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalid or expired")

    existing = await User.find_one(User.email == invite.email)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_create = UserCreate(
        email=invite.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
    )
    user = User(**user_create.model_dump())
    await user.insert()

    invite.used = True
    await invite.save()

    return await _issue_tokens(user, redis)
