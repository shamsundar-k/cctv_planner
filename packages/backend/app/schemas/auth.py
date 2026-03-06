"""Pydantic request and response schemas for auth endpoints: login, token refresh, and logout."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AcceptInvitePreview(BaseModel):
    email: str
    expires_at: datetime


class AcceptInviteRequest(BaseModel):
    token: str
    full_name: str
    password: str
