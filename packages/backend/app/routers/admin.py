"""Admin router: invite generation (POST /invite) and user listing (GET /users)."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.deps import require_admin
from app.models.invite_token import InviteToken
from app.models.user import User
from app.schemas.admin import InviteRequest, InviteResponse, UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    body: InviteRequest,
    admin: User = Depends(require_admin),
) -> InviteResponse:
    now = datetime.now(timezone.utc)
    existing = await InviteToken.find_one(
        InviteToken.email == body.email,
        InviteToken.used == False,  # noqa: E712
        InviteToken.expires_at > now,
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending invite for this email already exists",
        )

    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    expires_at = now + timedelta(hours=settings.INVITE_TOKEN_TTL_HOURS)

    invite = InviteToken(
        token_hash=token_hash,
        email=str(body.email),
        invited_by=admin,  # type: ignore[arg-type]
        expires_at=expires_at,
    )
    await invite.insert()

    invite_url = f"{settings.FRONTEND_BASE_URL}/accept-invite?token={raw}"
    return InviteResponse(invite_url=invite_url, expires_at=expires_at)


@router.get("/users", response_model=list[UserResponse])
async def list_users(_: User = Depends(require_admin)) -> list[UserResponse]:
    users = await User.find_all().to_list()
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            system_role=u.system_role.value,
            created_at=u.created_at,
        )
        for u in users
    ]
