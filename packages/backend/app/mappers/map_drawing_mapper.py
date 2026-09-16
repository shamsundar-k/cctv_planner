"""Mapping helpers between drawing documents and API responses."""

from app.api_models.map_drawing import MapDrawingResponse
from app.db_schemas.map_drawing import MapDrawingDocument


def to_map_drawing_response(drawing: MapDrawingDocument) -> MapDrawingResponse:
    return MapDrawingResponse(
        uid=drawing.uid,
        label=drawing.label,
        purpose=drawing.purpose,
        shape=drawing.shape,
        style=drawing.style,
        visible=drawing.visible,
        locked=drawing.locked,
        created_at=drawing.created_at,
        updated_at=drawing.updated_at,
    )
