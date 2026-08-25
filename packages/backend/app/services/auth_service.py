"""Business workflows used by the auth HTTP routes."""

import hashlib
import logging
from datetime import UTC, datetime

from fastapi import HTTPException, status
from redis.asyncio import Redis

from app.api_models.auth import (
    AcceptInvitePreview,
    AcceptInviteRequest,
    LoginRequest,
    MessageResponse,
    PasswordChangeRequest,
    PasswordResetRequestCreate,
    TokenResponse,
)
from app.api_models.user import UserCreate
from app.core.security import DEFAULT_RESET_PASSWORD, hash_password, verify_password
from app.db_schemas.user import User
from app.models.invite_token import InviteToken
from app.models.password_reset_request import (
    PasswordResetRequest as PasswordResetRequestDocument,
)
from app.models.password_reset_request import PasswordResetStatus
from app.services.auth_token_service import issue_tokens, revoke_token, rotate_tokens

logger = logging.getLogger(__name__)
RESET_REQUEST_MESSAGE = (
    "If an account exists for that email, its password reset request has been sent."
)
INVALID_INVITE_DETAIL = "Token invalid or expired"


async def authenticate(body: LoginRequest, redis: Redis) -> TokenResponse:
    logger.info("Login attempt: email=%s", body.email)
    user = await User.find_one(User.email == body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return await issue_tokens(user, redis)


async def request_password_reset(
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
            reset_request = PasswordResetRequestDocument(
                user_id=user.id,
                email=user.email,
            )
            await reset_request.insert()
    return MessageResponse(message=RESET_REQUEST_MESSAGE)


async def refresh_session(refresh_token: str, redis: Redis) -> TokenResponse:
    logger.info("Refresh attempt")
    return await rotate_tokens(refresh_token, redis)


async def logout_session(
    refresh_token: str,
    redis: Redis,
    user: User,
) -> None:
    logger.info("Logout attempt: user_id=%s", user.id)
    await revoke_token(refresh_token, redis)


async def update_password(
    body: PasswordChangeRequest,
    redis: Redis,
    user: User,
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
    return await issue_tokens(user, redis)


async def get_invite_preview(token: str) -> AcceptInvitePreview:
    logger.info("Preview invite attempt")
    invite = await _get_valid_invite(token)
    return AcceptInvitePreview(email=invite.email, expires_at=invite.expires_at)


async def register_invited_user(
    body: AcceptInviteRequest,
    redis: Redis,
) -> TokenResponse:
    invite = await _get_valid_invite(body.token)
    existing = await User.find_one(User.email == invite.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user_create = UserCreate(
        email=invite.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
    )
    user = User(**user_create.model_dump())
    await user.insert()

    invite.used = True
    await invite.save()
    return await issue_tokens(user, redis)


async def _get_valid_invite(raw_token: str) -> InviteToken:
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    invite = await InviteToken.find_one(InviteToken.token_hash == token_hash)
    if invite is None or invite.used:
        raise _invalid_invite()

    expires_at = invite.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at <= datetime.now(UTC):
        raise _invalid_invite()
    return invite


def _invalid_invite() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=INVALID_INVITE_DETAIL,
    )
