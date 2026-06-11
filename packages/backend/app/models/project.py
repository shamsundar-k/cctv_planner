"""Beanie document for survey projects."""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from .user import User


class Project(Document):
    name: str
    description: str = ""
    # Optional base map location
    center_lat: float | None = None
    center_lng: float | None = None
    default_zoom: int | None = None
    created_by: Link[User]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"
        indexes = [
            IndexModel(
                [("created_by.$id", ASCENDING), ("name", ASCENDING)],
                unique=True,
            )
        ]
