"""Pydantic request and response schemas for camera model endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.camera_model import CameraType, LensType, SensorType


class CameraModelCreate(BaseModel):
    # Identity
    name: str
    manufacturer: str = ""
    model_number: str = ""
    camera_type: CameraType = CameraType.bullet
    location: str = ""
    notes: str | None = None

    # Lens
    focal_length_min: float = Field(gt=0)
    focal_length_max: float = Field(gt=0)
    h_fov_min: float = Field(gt=0, lt=360)          # ° at tele end
    h_fov_max: float = Field(gt=0, lt=360)          # ° at wide end
    v_fov_min: float = Field(gt=0, lt=180)          # ° at tele end
    v_fov_max: float = Field(gt=0, lt=180)          # ° at wide end
    lens_type: LensType = LensType.fixed
    ir_cut_filter: bool = True
    ir_range: float = Field(default=0.0, ge=0)      # m — effective IR illumination range; 0 = no IR

    # Sensor
    resolution_h: int = Field(gt=0)
    resolution_v: int = Field(gt=0)
    megapixels: float | None = Field(None, gt=0)  # Auto-calculated if not provided
    aspect_ratio: str | None = None  # Auto-calculated if not provided
    sensor_size: str | None = None
    sensor_type: SensorType = SensorType.cmos
    min_illumination: float = Field(default=0.0, ge=0)
    wdr: bool = False
    wdr_db: float | None = Field(None, gt=0)

    @model_validator(mode="after")
    def _calculate_and_validate(self) -> "CameraModelCreate":
        # Auto-calculate megapixels from resolution if not provided
        if not self.megapixels:
            exact_mp = (self.resolution_h * self.resolution_v) / 1_000_000
            # Round to nearest standard camera MP value
            standard_mp = [
                0.3, 0.5, 1, 2, 3, 5, 8, 12, 13, 16, 20, 24, 32, 48, 64
            ]
            self.megapixels = min(standard_mp, key=lambda x: abs(x - exact_mp))

        # Auto-calculate aspect ratio if not provided
        if not self.aspect_ratio:
            from math import gcd
            g = gcd(self.resolution_h, self.resolution_v)
            h_ratio = self.resolution_h // g
            v_ratio = self.resolution_v // g
            self.aspect_ratio = f"{h_ratio}:{v_ratio}"

        # Call lens geometry validation
        return self._validate_lens_geometry()

    def _validate_lens_geometry(self) -> "CameraModelCreate":
        if self.focal_length_max < self.focal_length_min:
            raise ValueError("focal_length_max must be >= focal_length_min.")
        if self.h_fov_max < self.h_fov_min:
            raise ValueError(
                "h_fov_max (wide-end FOV) must be >= h_fov_min (tele-end FOV)."
            )
        if self.v_fov_max < self.v_fov_min:
            raise ValueError(
                "v_fov_max (wide-end FOV) must be >= v_fov_min (tele-end FOV)."
            )
        if self.lens_type == LensType.fixed:
            if self.focal_length_max != self.focal_length_min:
                raise ValueError(
                    "Fixed lens cameras must have focal_length_min == focal_length_max."
                )
            if self.h_fov_max != self.h_fov_min:
                raise ValueError(
                    "Fixed lens cameras must have h_fov_max == h_fov_min."
                )
            if self.v_fov_max != self.v_fov_min:
                raise ValueError(
                    "Fixed lens cameras must have v_fov_max == v_fov_min."
                )
        return self


class CameraModelUpdate(BaseModel):
    # Identity
    name: str | None = None
    manufacturer: str | None = None
    model_number: str | None = None
    camera_type: CameraType | None = None
    location: str | None = None
    notes: str | None = None

    # Lens
    focal_length_min: float | None = Field(None, gt=0)
    focal_length_max: float | None = Field(None, gt=0)
    h_fov_min: float | None = Field(None, gt=0, lt=360)
    h_fov_max: float | None = Field(None, gt=0, lt=360)
    v_fov_min: float | None = Field(None, gt=0, lt=180)
    v_fov_max: float | None = Field(None, gt=0, lt=180)
    lens_type: LensType | None = None
    ir_cut_filter: bool | None = None
    ir_range: float | None = Field(None, gt=0)

    # Sensor
    resolution_h: int | None = Field(None, gt=0)
    resolution_v: int | None = Field(None, gt=0)
    megapixels: float | None = Field(None, gt=0)
    aspect_ratio: str | None = None
    sensor_size: str | None = None
    sensor_type: SensorType | None = None
    min_illumination: float | None = Field(None, ge=0)
    wdr: bool | None = None
    wdr_db: float | None = Field(None, gt=0)  # Only applies when wdr=True

    @model_validator(mode="after")
    def _validate_partial_lens_geometry(self) -> "CameraModelUpdate":
        if (
            self.focal_length_max is not None
            and self.focal_length_min is not None
            and self.focal_length_max < self.focal_length_min
        ):
            raise ValueError("focal_length_max must be >= focal_length_min.")
        if (
            self.h_fov_max is not None
            and self.h_fov_min is not None
            and self.h_fov_max < self.h_fov_min
        ):
            raise ValueError(
                "h_fov_max (wide-end FOV) must be >= h_fov_min (tele-end FOV)."
            )
        if (
            self.v_fov_max is not None
            and self.v_fov_min is not None
            and self.v_fov_max < self.v_fov_min
        ):
            raise ValueError(
                "v_fov_max (wide-end FOV) must be >= v_fov_min (tele-end FOV)."
            )
        return self


class CameraModelResponse(BaseModel):
    id: str

    # Identity
    name: str
    manufacturer: str
    model_number: str
    camera_type: CameraType
    location: str
    notes: str | None

    # Lens
    focal_length_min: float
    focal_length_max: float
    h_fov_min: float
    h_fov_max: float
    v_fov_min: float
    v_fov_max: float
    lens_type: LensType
    ir_cut_filter: bool
    ir_range: float

    # Sensor
    resolution_h: int
    resolution_v: int
    megapixels: float
    aspect_ratio: str
    sensor_size: str | None
    sensor_type: SensorType
    min_illumination: float
    wdr: bool
    wdr_db: float | None

    # Metadata
    created_by: str
    created_at: datetime
    updated_at: datetime
