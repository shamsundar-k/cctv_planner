"""Pydantic request schemas for camera instance endpoints."""

from pydantic import BaseModel, Field, model_validator


class CameraInstanceCreate(BaseModel):
    client_id: str
    camera_model_id: str
    label: str = ""
    lat: float
    lng: float
    bearing: float = 0.0
    camera_height: float = Field(default=3.0, gt=0)
    tilt_angle: float = 30.0
    focal_length_chosen: float | None = None
    colour: str = "#3B82F6"
    visible: bool = True
    fov_visible_geojson: dict | None = None
    fov_ir_geojson: dict | None = None
    target_distance: float | None = None
    target_height: float = Field(default=1.5, gt=0)
    ir_range_hint: float = Field(default=0.0, exclude=True)  # injected by route, not stored

    @model_validator(mode="after")
    def resolve_target_distance_default(self) -> "CameraInstanceCreate":
        if self.target_distance is None and self.ir_range_hint > 0:
            self.target_distance = self.ir_range_hint
        return self


class CameraInstanceUpdate(BaseModel):
    label: str | None = None
    lat: float | None = None
    lng: float | None = None
    bearing: float | None = None
    camera_height: float | None = Field(default=None, gt=0)
    tilt_angle: float | None = None
    focal_length_chosen: float | None = None
    colour: str | None = None
    visible: bool | None = None
    fov_visible_geojson: dict | None = None
    fov_ir_geojson: dict | None = None
    target_distance: float | None = None
    target_height: float | None = Field(default=None, gt=0)
    ir_range_hint: float = Field(default=0.0, exclude=True)  # injected by route, not stored

    @model_validator(mode="after")
    def resolve_target_distance_default(self) -> "CameraInstanceUpdate":
        if self.target_distance is None and self.ir_range_hint > 0:
            self.target_distance = self.ir_range_hint
        return self
