"""Beanie document for invite tokens. Fields: token_hash (SHA-256), email, invited_by (User link), expires_at, used, created_at."""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from .user import User


class InviteToken(Document):
    token_hash: str
    email: str
    invited_by: Link[User]
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invite_tokens"
        indexes = ["token_hash"]
