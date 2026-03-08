"""Pydantic request and response schemas for project endpoints."""

from datetime import datetime

from pydantic import BaseModel

from app.models.project import CollaboratorRole


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CollaboratorAdd(BaseModel):
    user_id: str
    role: CollaboratorRole = CollaboratorRole.viewer


class CollaboratorResponse(BaseModel):
    user_id: str
    role: CollaboratorRole


class CameraInstanceSummary(BaseModel):
    id: str
    label: str
    lat: float
    lng: float
    bearing: float
    height: float
    tilt_angle: float
    focal_length_chosen: float | None
    colour: str
    visible: bool
    fov_geojson: dict | None
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


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    collaborators: list[CollaboratorResponse]
    created_at: datetime
    updated_at: datetime


class ProjectDetailResponse(ProjectResponse):
    cameras: list[CameraInstanceSummary]
    zones: list[ZoneSummary]
