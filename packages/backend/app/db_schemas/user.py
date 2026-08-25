"""Beanie document for system users."""

from datetime import datetime, timezone

from beanie import Document
from pydantic import EmailStr, Field

from app.api_models.user import SystemRole


class User(Document):
    email: EmailStr
    full_name: str = Field(..., min_length=1)
    hashed_password: str
    system_role: SystemRole = SystemRole.user
    must_change_password: bool = False
    token_version: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = ["email"]
