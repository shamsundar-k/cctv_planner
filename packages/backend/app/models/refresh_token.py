"""MongoDB-backed, single-use refresh-token sessions."""

from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class RefreshToken(Document):
    """A hashed refresh token that can be consumed once to rotate a session."""

    token_hash: str
    user_id: PydanticObjectId
    token_version: int = Field(ge=0)
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "refresh_tokens"
        indexes = [
            IndexModel([("token_hash", ASCENDING)], unique=True),
            IndexModel([("expires_at", ASCENDING)], expireAfterSeconds=0),
            IndexModel([("user_id", ASCENDING), ("expires_at", ASCENDING)]),
        ]
