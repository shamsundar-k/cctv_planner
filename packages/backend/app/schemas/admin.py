"""Pydantic schemas for admin endpoints: invite generation and user listing."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class InviteRequest(BaseModel):
    email: EmailStr


class InviteResponse(BaseModel):
    id: str
    invite_url: str
    expires_at: datetime


class InviteListItem(BaseModel):
    id: str
    email: str
    invited_by_email: str
    created_at: datetime
    expires_at: datetime


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    system_role: str
    created_at: datetime
