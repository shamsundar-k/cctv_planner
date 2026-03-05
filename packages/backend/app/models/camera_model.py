"""Beanie document for reusable camera specs. Fields: name, manufacturer, fov_angle (deg), min_range/max_range (metres), created_by (User link), created_at."""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from .user import User


class CameraModel(Document):
    name: str
    manufacturer: str = ""
    fov_angle: float          # horizontal field of view in degrees
    min_range: float = 0.0    # metres; 0 means no blind spot
    max_range: float          # metres
    created_by: Link[User]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "camera_models"
