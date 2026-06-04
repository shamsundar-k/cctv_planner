from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from .camera_lens_spec import CameraLensSpec
from .camera_sensor_spec import CameraSensorSpec


class CameraType(str, Enum):
    DOME = "dome"
    BULLET = "bullet"
    PTZ = "ptz"


class CameraSpec(BaseModel):
    name: str = Field(..., min_length=1)
    manufacturer: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    camera_type: CameraType
    lens_spec: CameraLensSpec
    sensor_spec: CameraSensorSpec
    ir_range: float = Field(..., ge=0, description="IR illumination range in meters")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Dome 2MP",
                    "manufacturer": "Hikvision",
                    "model": "DS-2CD1123G0-I",
                    "camera_type": "dome",
                    "lens_spec": {
                        "lens_type": "fixed",
                        "focal_length": {"min": 2.8, "max": 2.8},
                        "h_fov": {"min": 105.0, "max": 105.0},
                        "v_fov": {"min": 56.0, "max": 56.0},
                    },
                    "sensor_spec": {
                        "resolution": {
                            "horizontal": 1920,
                            "vertical": 1080,
                        },
                        "megapixel": 2.0,
                        "sensor_size": "1/2.8 inch",
                    },
                    "ir_range": 30.0,
                }
            ]
        }
    }


class CameraSpecUpdate(BaseModel):
    name: str | None = Field(None, min_length=1)
    manufacturer: str | None = Field(None, min_length=1)
    model: str | None = Field(None, min_length=1)
    camera_type: CameraType | None = None
    lens_spec: CameraLensSpec | None = None
    sensor_spec: CameraSensorSpec | None = None
    ir_range: float | None = Field(None, ge=0, description="IR illumination range in meters")


class CameraSpecRecord(CameraSpec):
    id: str
    created_at: datetime
    updated_at: datetime
