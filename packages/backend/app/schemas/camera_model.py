"""Pydantic request and response schemas for camera model endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class CameraModelCreate(BaseModel):
    name: str
    manufacturer: str = ""
    fov_angle: float = Field(..., gt=0, le=360)
    min_range: float = Field(0.0, ge=0)
    max_range: float = Field(..., gt=0)


class CameraModelUpdate(BaseModel):
    name: str | None = None
    manufacturer: str | None = None
    fov_angle: float | None = Field(None, gt=0, le=360)
    min_range: float | None = Field(None, ge=0)
    max_range: float | None = Field(None, gt=0)


class CameraModelResponse(BaseModel):
    id: str
    name: str
    manufacturer: str
    fov_angle: float
    min_range: float
    max_range: float
    created_by: str
    created_at: datetime
