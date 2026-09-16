"""Project-scoped CRUD routes for map drawings."""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api_models.map_drawing import (
    MapDrawingCreate,
    MapDrawingResponse,
    MapDrawingUpdate,
)
from app.core.deps import get_current_user
from app.db_schemas.user import User
from app.mappers.map_drawing_mapper import to_map_drawing_response
from app.services import map_drawing_service

router = APIRouter(
    prefix="/projects/{project_id}/drawings",
    tags=["map-drawings"],
)


def _http_error(error: map_drawing_service.MapDrawingServiceError) -> HTTPException:
    if isinstance(error, map_drawing_service.ProjectAccessDeniedError):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if isinstance(error, map_drawing_service.DuplicateDrawingUidError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Drawing with this uid already exists in this project",
        )
    if isinstance(error, map_drawing_service.MapDrawingNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drawing not found",
        )
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found",
    )


@router.get("", response_model=list[MapDrawingResponse])
async def list_map_drawings(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> list[MapDrawingResponse]:
    try:
        drawings = await map_drawing_service.list_drawings(project_id, current_user)
    except map_drawing_service.MapDrawingServiceError as error:
        raise _http_error(error) from error
    return [to_map_drawing_response(drawing) for drawing in drawings]


@router.post(
    "",
    response_model=MapDrawingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_map_drawing(
    project_id: PydanticObjectId,
    body: MapDrawingCreate,
    current_user: User = Depends(get_current_user),
) -> MapDrawingResponse:
    try:
        drawing = await map_drawing_service.create_drawing(
            project_id,
            body,
            current_user,
        )
    except map_drawing_service.MapDrawingServiceError as error:
        raise _http_error(error) from error
    return to_map_drawing_response(drawing)


@router.patch("/{uid}", response_model=MapDrawingResponse)
async def update_map_drawing(
    project_id: PydanticObjectId,
    uid: str,
    body: MapDrawingUpdate,
    current_user: User = Depends(get_current_user),
) -> MapDrawingResponse:
    try:
        drawing = await map_drawing_service.update_drawing(
            project_id,
            uid,
            body,
            current_user,
        )
    except map_drawing_service.MapDrawingServiceError as error:
        raise _http_error(error) from error
    return to_map_drawing_response(drawing)


@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_map_drawing(
    project_id: PydanticObjectId,
    uid: str,
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        await map_drawing_service.delete_drawing(project_id, uid, current_user)
    except map_drawing_service.MapDrawingServiceError as error:
        raise _http_error(error) from error
