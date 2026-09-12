"""Shape-specific payloads for persisted map drawings."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.api_models.map_drawing.geometry import (
    LineStringGeometry,
    PointGeometry,
    PolygonGeometry,
)


class DrawingShapeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LineShape(DrawingShapeModel):
    shape_type: Literal["line"] = "line"
    geometry: LineStringGeometry


class PolygonShape(DrawingShapeModel):
    shape_type: Literal["polygon"] = "polygon"
    geometry: PolygonGeometry


class RectangleShape(DrawingShapeModel):
    shape_type: Literal["rectangle"] = "rectangle"
    geometry: PolygonGeometry

    @model_validator(mode="after")
    def validate_rectangle_ring(self) -> "RectangleShape":
        if len(self.geometry.coordinates) != 1:
            raise ValueError("rectangles must contain exactly one ring")

        ring = self.geometry.coordinates[0]
        if len(ring) != 5 or len(set(ring[:-1])) != 4:
            raise ValueError(
                "rectangles must contain four distinct corners and a closing position"
            )
        return self


class CircleShape(DrawingShapeModel):
    shape_type: Literal["circle"] = "circle"
    geometry: PointGeometry
    radius_metres: float = Field(gt=0, le=100_000, allow_inf_nan=False)


class MarkerShape(DrawingShapeModel):
    shape_type: Literal["marker"] = "marker"
    geometry: PointGeometry


DrawingShape = Annotated[
    LineShape | PolygonShape | RectangleShape | CircleShape | MarkerShape,
    Field(discriminator="shape_type"),
]
