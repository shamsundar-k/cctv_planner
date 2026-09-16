"""Persistence and project-access operations for map drawings."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

from app.api_models.map_drawing import MapDrawingCreate, MapDrawingUpdate
from app.db_schemas.map_drawing import MapDrawingDocument
from app.db_schemas.project import Project
from app.db_schemas.user import User


class MapDrawingServiceError(Exception):
    """Base class for errors translated by the drawing router."""


class ProjectNotFoundError(MapDrawingServiceError):
    pass


class ProjectAccessDeniedError(MapDrawingServiceError):
    pass


class MapDrawingNotFoundError(MapDrawingServiceError):
    pass


class DuplicateDrawingUidError(MapDrawingServiceError):
    pass


def _is_project_owner(project: Project, user: User) -> bool:
    created_by = project.created_by
    if isinstance(created_by, User):
        return created_by.id == user.id
    return created_by.ref.id == user.id  # type: ignore[union-attr]


async def get_project_for_owner(
    project_id: PydanticObjectId,
    user: User,
) -> Project:
    project = await Project.get(project_id)
    if project is None:
        raise ProjectNotFoundError
    if not _is_project_owner(project, user):
        raise ProjectAccessDeniedError
    return project


async def _get_drawing_for_project(
    project: Project,
    uid: str,
) -> MapDrawingDocument:
    drawing = await MapDrawingDocument.find_one(
        {"project.$id": project.id, "uid": uid}
    )
    if drawing is None:
        raise MapDrawingNotFoundError
    return drawing


async def list_drawings(
    project_id: PydanticObjectId,
    user: User,
) -> list[MapDrawingDocument]:
    project = await get_project_for_owner(project_id, user)
    return await MapDrawingDocument.find(
        {"project.$id": project.id}
    ).sort("-updated_at").to_list()


async def create_drawing(
    project_id: PydanticObjectId,
    body: MapDrawingCreate,
    user: User,
) -> MapDrawingDocument:
    project = await get_project_for_owner(project_id, user)
    drawing = MapDrawingDocument(
        uid=body.uid,
        project=project,  # type: ignore[arg-type]
        label=body.label,
        purpose=body.purpose,
        shape=body.shape,
        style=body.style,
        visible=body.visible,
        locked=body.locked,
    )
    try:
        await drawing.insert()
    except DuplicateKeyError as error:
        raise DuplicateDrawingUidError from error
    return drawing


async def update_drawing(
    project_id: PydanticObjectId,
    uid: str,
    body: MapDrawingUpdate,
    user: User,
) -> MapDrawingDocument:
    project = await get_project_for_owner(project_id, user)
    drawing = await _get_drawing_for_project(project, uid)

    updates = body.model_dump(exclude_none=True, exclude_unset=True)
    if not updates:
        return drawing

    updates["updated_at"] = datetime.now(timezone.utc)
    await drawing.set(updates)
    return await _get_drawing_for_project(project, uid)


async def delete_drawing(
    project_id: PydanticObjectId,
    uid: str,
    user: User,
) -> None:
    project = await get_project_for_owner(project_id, user)
    drawing = await _get_drawing_for_project(project, uid)
    await drawing.delete()
