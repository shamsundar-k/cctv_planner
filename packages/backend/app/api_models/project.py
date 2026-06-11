"""Pydantic request and response models for project endpoints."""

from datetime import datetime

from pydantic import BaseModel


class Project(BaseModel):
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


class CameraSummary(BaseModel):
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


class ProjectRecord(Project):
    id: str
    created_by_id: str
    camera_count: int = 0
    created_at: datetime
    updated_at: datetime


class ProjectDetailRecord(ProjectRecord):
    cameras: list[CameraSummary]
