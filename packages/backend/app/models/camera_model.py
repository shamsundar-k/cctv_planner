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
from pymongo import ASCENDING, IndexModel

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
    ir_range: float = Field(default=0.0, ge=0)        # m — effective IR illumination range; 0 = no IR

    # ── Sensor ────────────────────────────────────────────────────────────────
    resolution_h: int = Field(gt=0)                 # pixels — horizontal
    resolution_v: int = Field(gt=0)                 # pixels — vertical
    megapixels: float = Field(gt=0)                 # e.g. 2.0 for 1920×1080
    aspect_ratio: str                               # e.g. "16:9" — required for frontend layout
    sensor_size: str | None = None                  # e.g. '1/2.8"'
    sensor_type: SensorType = SensorType.cmos
    min_illumination: float = Field(default=0.0, ge=0)  # lux — 0 = can see in darkness
    wdr: bool = False
    wdr_db: float | None = Field(None, gt=0)        # dB — only set if wdr=True

    # ── Metadata ──────────────────────────────────────────────────────────────
    created_by: Link[User]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def _calculate_and_validate(self) -> "CameraModel":
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
        indexes = [
            IndexModel(
                [("name", ASCENDING), ("created_by.$id", ASCENDING)],
                unique=True,
            )
        ]

