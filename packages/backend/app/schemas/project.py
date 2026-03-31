"""Pydantic request and response schemas for project endpoints."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.camera_model import CameraModelResponse



class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    center_lat: float | None = None
    center_lng: float | None = None
    default_zoom: int | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    center_lat: float | None = None
    center_lng: float | None = None
    default_zoom: int | None = None




class CameraInstanceSummary(BaseModel):
    id: str
    client_id: str
    label: str
    lat: float
    lng: float
    bearing: float
    camera_height: float
    tilt_angle: float
    focal_length_chosen: float | None
    colour: str
    visible: bool
    fov_visible_geojson: dict | None
    fov_ir_geojson: dict | None
    target_distance: float | None
    target_height: float
    camera_model_id: str
    created_at: datetime
    updated_at: datetime


class ZoneSummary(BaseModel):
    id: str
    label: str
    zone_type: str
    colour: str
    visible: bool
    geojson: dict
    created_at: datetime
    updated_at: datetime


class ImportedCameraItem(BaseModel):
    camera_model: CameraModelResponse
    placed_count: int


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    center_lat: float | None = None
    center_lng: float | None = None
    default_zoom: int | None = None
    camera_count: int = 0
    zone_count: int = 0
    imported_camera_model_count: int = 0
    created_at: datetime
    updated_at: datetime


class ProjectDetailResponse(ProjectResponse):
    cameras: list[CameraInstanceSummary]
    zones: list[ZoneSummary]
