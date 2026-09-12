"""Validated GeoJSON geometry primitives used by map drawings."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


Longitude = Annotated[float, Field(ge=-180, le=180, allow_inf_nan=False)]
Latitude = Annotated[float, Field(ge=-90, le=90, allow_inf_nan=False)]
Position = tuple[Longitude, Latitude]

LinePositions = Annotated[list[Position], Field(min_length=2, max_length=2_000)]
PolygonRing = Annotated[list[Position], Field(min_length=4, max_length=2_001)]
PolygonRings = Annotated[list[PolygonRing], Field(min_length=1, max_length=16)]


class GeoJsonModel(BaseModel):
    """Base model for the supported strict GeoJSON subset."""

    model_config = ConfigDict(extra="forbid")


class PointGeometry(GeoJsonModel):
    type: Literal["Point"] = "Point"
    coordinates: Position


class LineStringGeometry(GeoJsonModel):
    type: Literal["LineString"] = "LineString"
    coordinates: LinePositions


class PolygonGeometry(GeoJsonModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: PolygonRings

    @model_validator(mode="after")
    def validate_rings(self) -> "PolygonGeometry":
        for ring in self.coordinates:
            if ring[0] != ring[-1]:
                raise ValueError("polygon rings must be closed")
            if len(set(ring[:-1])) < 3:
                raise ValueError(
                    "polygon rings must contain at least three distinct positions"
                )
        return self
