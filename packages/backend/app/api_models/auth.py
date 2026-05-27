"""Pydantic request and response schemas for auth endpoints: login, token refresh, and logout."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


MAX_BCRYPT_PASSWORD_BYTES = 72


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)

    @field_validator("refresh_token")
    @classmethod
    def refresh_token_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("refresh_token must not be blank")
        return value


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"


class AcceptInvitePreview(BaseModel):
    email: EmailStr
    expires_at: datetime


class AcceptInviteRequest(BaseModel):
    token: str = Field(min_length=1)
    full_name: str
    password: str = Field(min_length=8)

    @field_validator("token")
    @classmethod
    def token_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("token must not be blank")
        return value

    @field_validator("password")
    @classmethod
    def password_must_fit_bcrypt_limit(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("password must not be blank")
        if len(value.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
            raise ValueError(
                f"password must be at most {MAX_BCRYPT_PASSWORD_BYTES} bytes"
            )
        return value
