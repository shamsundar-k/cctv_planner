"""Pydantic schemas for admin endpoints: invite generation and user listing."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class InviteRequest(BaseModel):
    email: EmailStr


class InviteResponse(BaseModel):
    invite_url: str
    expires_at: datetime


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    system_role: str
    created_at: datetime
