"""Beanie document for project-scoped map drawings."""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field
from pymongo import ASCENDING, DESCENDING, IndexModel

from app.api_models.map_drawing import (
    DrawingPurpose,
    DrawingShape,
    DrawingStyle,
    DrawingUid,
)
from app.db_schemas.project import Project


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MapDrawingDocument(Document):
    uid: DrawingUid
    project: Link[Project]
    label: str = Field(default="", max_length=120)
    purpose: DrawingPurpose = DrawingPurpose.ANNOTATION
    shape: DrawingShape
    style: DrawingStyle = Field(default_factory=DrawingStyle)
    visible: bool = True
    locked: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "map_drawings"
        indexes = [
            IndexModel(
                [("project.$id", ASCENDING), ("uid", ASCENDING)],
                unique=True,
            ),
            IndexModel(
                [("project.$id", ASCENDING), ("updated_at", DESCENDING)]
            ),
        ]
