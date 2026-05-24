from datetime import datetime, timezone

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.api_models.camera.camera_lens_spec import CameraLensSpec
from app.api_models.camera.camera_sensor_spec import CameraSensorSpec
from app.api_models.camera.camera_spec import CameraType


class CameraSpecification(Document):
    name: str = Field(..., min_length=1)
    manufacturer: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    camera_type: CameraType
    lens_spec: CameraLensSpec
    sensor_spec: CameraSensorSpec
    ir_range: float = Field(..., ge=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "camera_specifications"
        indexes = [
            IndexModel(
                [("manufacturer", ASCENDING), ("model", ASCENDING)],
                unique=True,
            ),
            IndexModel([("name", ASCENDING)]),
            IndexModel([("camera_type", ASCENDING)]),
        ]
