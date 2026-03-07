"""Pydantic request and response schemas for camera model endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.camera_model import LensType


class CameraModelCreate(BaseModel):
    name: str
    manufacturer: str = ""
    lens_type: LensType = LensType.fixed

    # Fixed-only fields
    fov_angle: float | None = Field(None, gt=0, le=360)
    min_range: float = Field(0.0, ge=0)
    max_range: float | None = Field(None, gt=0)

    # Varifocal-only fields
    fov_angle_wide: float | None = Field(None, gt=0, le=360)
    max_range_wide: float | None = Field(None, gt=0)
    fov_angle_tele: float | None = Field(None, gt=0, le=360)
    max_range_tele: float | None = Field(None, gt=0)

    @model_validator(mode="after")
    def _validate_lens_type_fields(self) -> "CameraModelCreate":
        varifocal_fields = (
            self.fov_angle_wide,
            self.max_range_wide,
            self.fov_angle_tele,
            self.max_range_tele,
        )
        if self.lens_type == LensType.fixed:
            if self.fov_angle is None or self.max_range is None:
                raise ValueError("Fixed cameras require fov_angle and max_range.")
            if any(f is not None for f in varifocal_fields):
                raise ValueError("Fixed cameras must not supply varifocal zoom-range fields.")
        else:
            if any(f is None for f in varifocal_fields):
                raise ValueError(
                    "Varifocal cameras require fov_angle_wide, max_range_wide, "
                    "fov_angle_tele, and max_range_tele."
                )
            if self.fov_angle is not None or self.max_range is not None:
                raise ValueError(
                    "Varifocal cameras must not supply fov_angle or max_range directly."
                )
            if self.fov_angle_tele >= self.fov_angle_wide:  # type: ignore[operator]
                raise ValueError("fov_angle_tele must be less than fov_angle_wide.")
            if self.max_range_wide >= self.max_range_tele:  # type: ignore[operator]
                raise ValueError("max_range_wide must be less than max_range_tele.")
        return self


class CameraModelUpdate(BaseModel):
    name: str | None = None
    manufacturer: str | None = None
    lens_type: LensType | None = None
    fov_angle: float | None = Field(None, gt=0, le=360)
    min_range: float | None = Field(None, ge=0)
    max_range: float | None = Field(None, gt=0)
    fov_angle_wide: float | None = Field(None, gt=0, le=360)
    max_range_wide: float | None = Field(None, gt=0)
    fov_angle_tele: float | None = Field(None, gt=0, le=360)
    max_range_tele: float | None = Field(None, gt=0)

    @model_validator(mode="after")
    def _validate_cross_field_order(self) -> "CameraModelUpdate":
        if (
            self.fov_angle_tele is not None
            and self.fov_angle_wide is not None
            and self.fov_angle_tele >= self.fov_angle_wide
        ):
            raise ValueError("fov_angle_tele must be less than fov_angle_wide.")
        if (
            self.max_range_wide is not None
            and self.max_range_tele is not None
            and self.max_range_wide >= self.max_range_tele
        ):
            raise ValueError("max_range_wide must be less than max_range_tele.")
        return self


class CameraModelResponse(BaseModel):
    id: str
    name: str
    manufacturer: str
    lens_type: LensType
    fov_angle: float | None
    min_range: float
    max_range: float | None
    fov_angle_wide: float | None
    max_range_wide: float | None
    fov_angle_tele: float | None
    max_range_tele: float | None
    created_by: str
    created_at: datetime
