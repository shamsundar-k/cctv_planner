"""Beanie document for survey projects. Fields: name, description, owner (User link), collaborators (list of {user_id, role}), created_at, updated_at."""

from datetime import datetime, timezone

from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from .user import User


class Project(Document):
    name: str
    description: str = ""
    owner: Link[User]
    # Optional base map location
    center_lat: float | None = None
    center_lng: float | None = None
    default_zoom: int | None = None
    imported_camera_model_ids: list[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"
        indexes = [
            IndexModel(
                [("owner.$id", ASCENDING), ("name", ASCENDING)],
                unique=True,
            )
        ]
