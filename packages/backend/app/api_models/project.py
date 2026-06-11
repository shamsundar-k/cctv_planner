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


class ProjectRecord(Project):
    id: str
    created_by_id: str
    camera_count: int = 0
    created_at: datetime
    updated_at: datetime
