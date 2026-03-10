"""Beanie document for reusable camera hardware specifications.

The model is organised into three logical groups:

  Identity  — name, manufacturer, model_number, camera_type, location, notes
  Lens      — focal length envelope, H/V FOV envelope, lens type, IR cut filter
  Sensor    — resolution, sensor characteristics, low-light performance

Stage 1 (geometric coverage) and Stage 2 (DORI performance) calculations are
computed on the frontend from these stored hardware parameters.

Standard Reference: IEC EN 62676-4:2015
"""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document, Link
from pydantic import Field, model_validator

from .user import User


class CameraType(str, Enum):
    fixed_dome = "fixed_dome"
    ptz = "ptz"
    bullet = "bullet"


class LensType(str, Enum):
    fixed = "fixed"
    varifocal = "varifocal"
    optical_zoom = "optical_zoom"


class SensorType(str, Enum):
    cmos = "cmos"


class CameraModel(Document):

    # ── Identity ──────────────────────────────────────────────────────────────
    name: str
    manufacturer: str = ""
    model_number: str = ""                          # e.g. "DS-2CD2T47G2-L"
    camera_type: CameraType = CameraType.bullet
    location: str = ""
    notes: str | None = None

    # ── Lens ──────────────────────────────────────────────────────────────────
    # focal_length_min/max define the zoom range (equal for fixed lenses).
    # h/v_fov_min is the FOV at the tele end (focal_length_max).
    # h/v_fov_max is the FOV at the wide end (focal_length_min).
    focal_length_min: float = Field(gt=0)           # mm — widest angle
    focal_length_max: float = Field(gt=0)           # mm — narrowest; == min for fixed
    h_fov_min: float = Field(gt=0, lt=360)          # ° — H-FOV at tele end
    h_fov_max: float = Field(gt=0, lt=360)          # ° — H-FOV at wide end
    v_fov_min: float = Field(gt=0, lt=180)          # ° — V-FOV at tele end
    v_fov_max: float = Field(gt=0, lt=180)          # ° — V-FOV at wide end
    lens_type: LensType = LensType.fixed
    ir_cut_filter: bool = True
    ir_range: float | None = Field(None, gt=0)        # m — effective IR illumination range

    # ── Sensor ────────────────────────────────────────────────────────────────
    resolution_h: int = Field(gt=0)                 # pixels — horizontal
    resolution_v: int = Field(gt=0)                 # pixels — vertical
    megapixels: float | None = Field(None, gt=0)
    aspect_ratio: str | None = None                 # e.g. "16:9"
    sensor_size: str | None = None                  # e.g. '1/2.8"'
    sensor_type: SensorType = SensorType.cmos
    min_illumination: float | None = Field(None, ge=0)  # lux
    wdr: bool = False
    wdr_db: float | None = Field(None, gt=0)        # dB

    # ── Metadata ──────────────────────────────────────────────────────────────
    created_by: Link[User]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def _validate_lens_geometry(self) -> "CameraModel":
        if self.focal_length_max < self.focal_length_min:
            raise ValueError(
                "focal_length_max must be >= focal_length_min."
            )
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

    class Settings:
        name = "camera_models"

