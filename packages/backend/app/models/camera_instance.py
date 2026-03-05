"""Beanie document for a camera placed on a project map. Fields: project/camera_model links, label, lat/lng, bearing, FOV overrides, colour, visible, fov_geojson (computed GeoJSON), timestamps."""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from .camera_model import CameraModel
from .project import Project


class CameraInstance(Document):
    project: Link[Project]
    camera_model: Link[CameraModel]
    label: str = ""
    lat: float
    lng: float
    bearing: float = 0.0          # degrees, 0 = North
    fov_angle_override: float | None = None   # overrides model default
    min_range_override: float | None = None
    max_range_override: float | None = None
    colour: str = "#3B82F6"       # hex colour for FOV rendering
    visible: bool = True
    fov_geojson: dict | None = None           # computed GeoJSON Polygon
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "camera_instances"
        indexes = ["project"]
