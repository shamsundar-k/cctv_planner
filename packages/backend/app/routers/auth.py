"""HTTP routes for authentication and invitation acceptance."""

from fastapi import APIRouter, Depends, Query, status

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
from app.core.deps import get_authenticated_user
from app.db_schemas.user import User
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    return await auth_service.authenticate(body)


@router.post(
    "/password-reset-requests",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_password_reset_request(
    body: PasswordResetRequestCreate,
) -> MessageResponse:
    return await auth_service.request_password_reset(body)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
) -> TokenResponse:
    return await auth_service.refresh_session(body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    user: User = Depends(get_authenticated_user),
) -> None:
    await auth_service.logout_session(body.refresh_token, user)


@router.post("/change-password", response_model=TokenResponse)
async def change_password(
    body: PasswordChangeRequest,
    user: User = Depends(get_authenticated_user),
) -> TokenResponse:
    return await auth_service.update_password(body, user)


@router.get("/accept-invite", response_model=AcceptInvitePreview)
async def preview_invite(token: str = Query(...)) -> AcceptInvitePreview:
    return await auth_service.get_invite_preview(token)


@router.post(
    "/accept-invite",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def accept_invite(
    body: AcceptInviteRequest,
) -> TokenResponse:
    return await auth_service.register_invited_user(body)
