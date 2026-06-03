from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.api_models.camera.coverage_area import CoverageArea
from app.api_models.camera.target_data import TargetData
from app.api_models.geo_location import GeoLocation
from app.db_schemas.camera_specification import CameraSpecification
from app.models.project import Project


class CameraPlacementDocument(Document):
    uid: str = Field(..., min_length=1)
    project: Link[Project]
    camera_spec: Link[CameraSpecification]
    location: GeoLocation
    height: float = Field(default=3.0, gt=0)
    bearing: float = Field(default=0.0, ge=0, lt=360)
    label: str = Field(default="", max_length=120)
    color: str = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")
    coverage_area: CoverageArea | None = None
    target_data: TargetData = Field(default_factory=TargetData)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "camera_placements"
        indexes = [
            IndexModel(
                [("project.$id", ASCENDING), ("uid", ASCENDING)],
                unique=True,
            ),
            IndexModel([("camera_spec.$id", ASCENDING)]),
        ]
