from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.api_models.camera.camera_lens_spec import CameraLensSpec
from app.api_models.camera.camera_sensor_spec import CameraSensorSpec, Resolution
from app.api_models.camera.camera_spec import CameraSpec
from app.api_models.camera.focal_length_spec import FocalLength
from app.api_models.camera.fov_spec import FOV

MAX_CAMERA_TEXT_LENGTH = 200
MAX_SENSOR_SIZE_LENGTH = 100
MAX_FOCAL_LENGTH_MM = 1000
MAX_RESOLUTION_DIMENSION = 100_000
MAX_MEGAPIXEL = 1000
MAX_IR_RANGE_METERS = 10_000


class CameraSpecExportManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    format: Literal["cctv-planner-camera-model"]
    schema_version: Literal[1]
    source_id: str | None = Field(None, pattern=r"^[0-9a-fA-F]{24}$")
    model_file: Literal["model.json"]
    image_file: Literal["image.webp"]
    image_source: Literal["custom", "default"]
    image_sha256: str = Field(..., pattern=r"^[0-9a-f]{64}$")


class CameraSpecExportFocalLength(FocalLength):
    min: float = Field(..., gt=0, le=MAX_FOCAL_LENGTH_MM, allow_inf_nan=False)
    max: float = Field(..., gt=0, le=MAX_FOCAL_LENGTH_MM, allow_inf_nan=False)


class CameraSpecExportFOV(FOV):
    min: float = Field(..., gt=0, lt=180, allow_inf_nan=False)
    max: float = Field(..., gt=0, lt=180, allow_inf_nan=False)


class CameraSpecExportLensSpec(CameraLensSpec):
    focal_length: CameraSpecExportFocalLength
    h_fov: CameraSpecExportFOV
    v_fov: CameraSpecExportFOV


class CameraSpecExportResolution(Resolution):
    horizontal: int = Field(..., gt=0, le=MAX_RESOLUTION_DIMENSION)
    vertical: int = Field(..., gt=0, le=MAX_RESOLUTION_DIMENSION)


class CameraSpecExportSensorSpec(CameraSensorSpec):
    resolution: CameraSpecExportResolution
    megapixel: float | None = Field(
        None,
        gt=0,
        le=MAX_MEGAPIXEL,
        allow_inf_nan=False,
    )
    sensor_size: str | None = Field(None, max_length=MAX_SENSOR_SIZE_LENGTH)


class CameraSpecExportModel(CameraSpec):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, max_length=MAX_CAMERA_TEXT_LENGTH)
    manufacturer: str = Field(..., min_length=1, max_length=MAX_CAMERA_TEXT_LENGTH)
    model: str = Field(..., min_length=1, max_length=MAX_CAMERA_TEXT_LENGTH)
    lens_spec: CameraSpecExportLensSpec
    sensor_spec: CameraSpecExportSensorSpec
    ir_range: float = Field(..., ge=0, le=MAX_IR_RANGE_METERS, allow_inf_nan=False)
