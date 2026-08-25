"""Pydantic models for users exposed through API boundaries."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class SystemRole(str, Enum):
    admin = "admin"
    user = "user"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1)
    system_role: SystemRole = SystemRole.user


class UserCreate(UserBase):
    hashed_password: str = Field(..., min_length=1)


class UserRecord(UserBase):
    id: str
    must_change_password: bool = False
    created_at: datetime
