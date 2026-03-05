"""Beanie document for system users. Fields: email, full_name, hashed_password, system_role (admin|user), created_at."""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import EmailStr, Field


class SystemRole(str, Enum):
    admin = "admin"
    user = "user"


class User(Document):
    email: EmailStr
    full_name: str
    hashed_password: str
    system_role: SystemRole = SystemRole.user
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = ["email"]
