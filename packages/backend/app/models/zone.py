"""Beanie document for drawn map zones. Fields: project link, label, zone_type (coverage_area|exclusion|annotation), colour, visible, geojson (GeoJSON Polygon or LineString), timestamps."""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document, Link
from pydantic import Field

from .project import Project


class ZoneType(str, Enum):
    coverage_area = "coverage_area"
    exclusion = "exclusion"
    annotation = "annotation"


class Zone(Document):
    project: Link[Project]
    label: str = ""
    zone_type: ZoneType = ZoneType.annotation
    colour: str = "#10B981"
    visible: bool = True
    geojson: dict           # GeoJSON Polygon or LineString
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "zones"
        indexes = ["project"]
