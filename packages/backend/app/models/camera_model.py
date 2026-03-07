"""Beanie document for reusable camera specs.

Fixed cameras: fov_angle + min_range + max_range.
Varifocal cameras: lens_type=varifocal + wide/tele envelope fields (fov_angle/max_range are None).
"""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document, Link
from pydantic import Field, model_validator

from .user import User


class LensType(str, Enum):
    fixed = "fixed"
    varifocal = "varifocal"


class CameraModel(Document):
    name: str
    manufacturer: str = ""
    lens_type: LensType = LensType.fixed

    # Fixed cameras — single values (None for varifocal)
    fov_angle: float | None = None     # horizontal field of view in degrees
    min_range: float = 0.0             # metres; 0 means no blind spot
    max_range: float | None = None     # metres

    # Varifocal zoom envelope (None for fixed cameras)
    fov_angle_wide: float | None = None   # widest FOV at short focal length
    max_range_wide: float | None = None   # shortest effective range at wide end
    fov_angle_tele: float | None = None   # narrowest FOV at long focal length
    max_range_tele: float | None = None   # longest effective range at tele end

    created_by: Link[User]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def _validate_lens_type_fields(self) -> "CameraModel":
        varifocal_fields = (
            self.fov_angle_wide,
            self.max_range_wide,
            self.fov_angle_tele,
            self.max_range_tele,
        )
        if self.lens_type == LensType.varifocal:
            if any(f is None for f in varifocal_fields):
                raise ValueError(
                    "Varifocal cameras must supply fov_angle_wide, max_range_wide, "
                    "fov_angle_tele, and max_range_tele."
                )
            if self.fov_angle_tele >= self.fov_angle_wide:  # type: ignore[operator]
                raise ValueError(
                    "fov_angle_tele must be less than fov_angle_wide "
                    "(tele end narrows the field of view)."
                )
            if self.max_range_wide >= self.max_range_tele:  # type: ignore[operator]
                raise ValueError(
                    "max_range_wide must be less than max_range_tele "
                    "(wide end has shorter effective range)."
                )
        else:
            if any(f is not None for f in varifocal_fields):
                raise ValueError(
                    "Fixed cameras must not supply varifocal zoom-range fields."
                )
            if self.fov_angle is None or self.max_range is None:
                raise ValueError("Fixed cameras must supply fov_angle and max_range.")
        return self

    class Settings:
        name = "camera_models"
