"""API and domain models for project-scoped map drawings."""

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.api_models.map_drawing.shape import DrawingShape
from app.api_models.map_drawing.style import DrawingStyle


DrawingUid = Annotated[
    str,
    StringConstraints(min_length=1, max_length=120, pattern=r".*\S.*"),
]


class DrawingPurpose(str, Enum):
    ANNOTATION = "annotation"
    COVERAGE_ZONE = "coverage_zone"
    EXCLUSION_ZONE = "exclusion_zone"
    SITE_BOUNDARY = "site_boundary"


class MapDrawingModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MapDrawingBase(MapDrawingModel):
    uid: DrawingUid
    label: str = Field(default="", max_length=120)
    purpose: DrawingPurpose = DrawingPurpose.ANNOTATION
    shape: DrawingShape
    style: DrawingStyle = Field(default_factory=DrawingStyle)
    visible: bool = True
    locked: bool = False


class MapDrawingCreate(MapDrawingBase):
    pass


class MapDrawingUpdate(MapDrawingModel):
    label: str | None = Field(default=None, max_length=120)
    purpose: DrawingPurpose | None = None
    shape: DrawingShape | None = None
    style: DrawingStyle | None = None
    visible: bool | None = None
    locked: bool | None = None


class MapDrawingResponse(MapDrawingBase):
    created_at: datetime
    updated_at: datetime
