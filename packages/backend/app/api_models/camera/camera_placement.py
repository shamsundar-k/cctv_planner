from datetime import datetime

from pydantic import BaseModel, Field

from app.api_models.camera.coverage_area import CoverageArea
from app.api_models.camera.target_data import TargetData
from app.api_models.geo_location import GeoLocation

# Model for placed cameras on map

class CameraPlacement(BaseModel):
    uid: str = Field(..., min_length=1, description="Frontend-generated placement id")
    camera_spec_id: str = Field(..., min_length=1)
    location: GeoLocation
    height: float = Field(
        default=3.0,
        gt=0,
        description="Camera mounting height in meters",
    )
    bearing: float = Field(
        default=0.0,
        ge=0,
        lt=360,
        description="Camera orientation in degrees, where 0 is north",
    )
    label: str = Field(default="", max_length=120)
    color: str = Field(
        default="#3B82F6",
        pattern=r"^#[0-9A-Fa-f]{6}$",
        description="Hex color used for rendering this camera placement",
    )
    coverage_area: CoverageArea | None = None
    target_data: TargetData = Field(default_factory=TargetData)
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "uid": "cam_01HX7N9P2R8W4K",
                    "camera_spec_id": "66584aef0f5f3e6d8f8a1234",
                    "location": {
                        "latitude": 40.7128,
                        "longitude": -74.006,
                    },
                    "height": 3.0,
                    "bearing": 45.0,
                    "label": "Main gate camera",
                    "color": "#3B82F6",
                    "coverage_area": {
                        "points": [
                            {"latitude": 40.7128, "longitude": -74.0060},
                            {"latitude": 40.7130, "longitude": -74.0055},
                            {"latitude": 40.7125, "longitude": -74.0050},
                            {"latitude": 40.7122, "longitude": -74.0057},
                        ]
                    },
                    "target_data": {
                        "distance": 40.0,
                        "height": 1.5,
                    },
                    "created_at": "2026-06-01T10:00:00Z",
                    "updated_at": "2026-06-01T10:00:00Z",
                }
            ]
        }
    }


class CameraPlacementUpdate(BaseModel):
    camera_spec_id: str | None = Field(None, min_length=1)
    location: GeoLocation | None = None
    height: float | None = Field(None, gt=0)
    bearing: float | None = Field(None, ge=0, lt=360)
    label: str | None = Field(None, max_length=120)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    coverage_area: CoverageArea | None = None
    target_data: TargetData | None = None


CameraPlacementResponse = CameraPlacement
