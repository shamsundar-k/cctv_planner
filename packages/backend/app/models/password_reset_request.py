"""Beanie document for administrator-reviewed password reset requests."""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import EmailStr, Field


class PasswordResetStatus(str, Enum):
    pending = "pending"
    reset = "reset"
    rejected = "rejected"


class PasswordResetRequest(Document):
    user_id: PydanticObjectId
    email: EmailStr
    status: PasswordResetStatus = PasswordResetStatus.pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: datetime | None = None
    resolved_by_id: PydanticObjectId | None = None

    class Settings:
        name = "password_reset_requests"
        indexes = ["user_id", "status", "created_at"]
