"""Admin router: invite management (POST/GET/DELETE /invite) and user listing (GET /users)."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from beanie import PydanticObjectId
from beanie.operators import In
from bson.dbref import DBRef
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.deps import require_admin
from app.models.invite_token import InviteToken
from app.models.user import User
from app.schemas.admin import (
    InviteListItem,
    InviteRequest,
    InviteResponse,
    UserResponse,
)

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
    return InviteResponse(id=str(invite.id), invite_url=invite_url, expires_at=expires_at)


@router.get("/invites", response_model=list[InviteListItem])
async def list_invites(_: User = Depends(require_admin)) -> list[InviteListItem]:
    now = datetime.now(timezone.utc)

    # Use the raw Motor collection to avoid Beanie's link-fetching aggregation,
    # which is broken with the current Motor version.
    collection = InviteToken.get_pymongo_collection()
    raw_docs = await collection.find(
        {"used": False, "expires_at": {"$gt": now}}
    ).to_list(length=None)

    if not raw_docs:
        return []

    # invited_by is stored as a DBRef by Beanie; extract the referenced ObjectIds.
    user_ids = list({
        doc["invited_by"].id
        for doc in raw_docs
        if isinstance(doc.get("invited_by"), DBRef)
    })

    # Single batch query for all inviting users (User has no Link fields → no aggregation).
    users = await User.find(In(User.id, user_ids)).to_list()
    email_map: dict[str, str] = {str(u.id): u.email for u in users}

    return [
        InviteListItem(
            id=str(doc["_id"]),
            email=doc["email"],
            invited_by_email=(
                email_map.get(str(doc["invited_by"].id), "unknown")
                if isinstance(doc.get("invited_by"), DBRef)
                else "unknown"
            ),
            created_at=doc["created_at"],
            expires_at=doc["expires_at"],
        )
        for doc in raw_docs
    ]


@router.delete("/invites/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(
    invite_id: PydanticObjectId,
    _: User = Depends(require_admin),
) -> None:
    invite = await InviteToken.get(invite_id)
    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    await invite.delete()


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


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: PydanticObjectId,
    admin: User = Depends(require_admin),
) -> None:
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    user = await User.get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user.delete()
