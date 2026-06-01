from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.api_models.camera.camera_placement import (
    CameraPlacement,
    CameraPlacementUpdate,
)
from app.core.deps import get_current_user
from app.db_schemas.camera_placement import CameraPlacementDocument
from app.db_schemas.camera_specification import CameraSpecification
from app.mappers.camera_placement_mapper import to_camera_placement_response
from app.models.project import Project
from app.models.user import User

router = APIRouter(
    prefix="/projects/{project_id}/camera-placements",
    tags=["camera-placements"],
)


def _is_owner(project: Project, user: User) -> bool:
    owner = project.owner
    if isinstance(owner, User):
        return owner.id == user.id
    return owner.ref.id == user.id  # type: ignore[union-attr]


def _require_access(project: Project, user: User) -> None:
    if not _is_owner(project, user) and user.system_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )


async def _get_project_for_user(project_id: PydanticObjectId, user: User) -> Project:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    _require_access(project, user)
    return project


async def _get_camera_spec(camera_spec_id: str) -> CameraSpecification:
    try:
        object_id = PydanticObjectId(camera_spec_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid camera_spec_id",
        )

    camera_spec = await CameraSpecification.get(object_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )
    return camera_spec


async def _get_camera_placement_for_project(
    project: Project,
    uid: str,
) -> CameraPlacementDocument:
    camera_placement = await CameraPlacementDocument.find_one(
        CameraPlacementDocument.project.id == project.id,  # type: ignore[union-attr]
        CameraPlacementDocument.uid == uid,
    )
    if camera_placement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera placement not found",
        )
    return camera_placement


@router.get("", response_model=list[CameraPlacement])
async def list_camera_placements(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> list[CameraPlacement]:
    project = await _get_project_for_user(project_id, current_user)

    camera_placements = await CameraPlacementDocument.find(
        CameraPlacementDocument.project.id == project.id  # type: ignore[union-attr]
    ).to_list()
    return [
        to_camera_placement_response(camera_placement)
        for camera_placement in camera_placements
    ]


@router.post(
    "",
    response_model=CameraPlacement,
    status_code=status.HTTP_201_CREATED,
)
async def create_camera_placement(
    project_id: PydanticObjectId,
    body: CameraPlacement,
    current_user: User = Depends(get_current_user),
) -> CameraPlacement:
    project = await _get_project_for_user(project_id, current_user)
    camera_spec = await _get_camera_spec(body.camera_spec_id)

    camera_placement = CameraPlacementDocument(
        uid=body.uid,
        project=project,  # type: ignore[arg-type]
        camera_spec=camera_spec,  # type: ignore[arg-type]
        location=body.location,
        height=body.height,
        bearing=body.bearing,
        label=body.label,
        color=body.color,
    )

    try:
        await camera_placement.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera placement with this uid already exists in this project",
        )

    return to_camera_placement_response(camera_placement)


@router.get("/{uid}", response_model=CameraPlacement)
async def get_camera_placement(
    project_id: PydanticObjectId,
    uid: str,
    current_user: User = Depends(get_current_user),
) -> CameraPlacement:
    project = await _get_project_for_user(project_id, current_user)
    camera_placement = await _get_camera_placement_for_project(project, uid)
    return to_camera_placement_response(camera_placement)


@router.put("/{uid}", response_model=CameraPlacement)
async def update_camera_placement(
    project_id: PydanticObjectId,
    uid: str,
    body: CameraPlacementUpdate,
    current_user: User = Depends(get_current_user),
) -> CameraPlacement:
    project = await _get_project_for_user(project_id, current_user)
    camera_placement = await _get_camera_placement_for_project(project, uid)

    updates = body.model_dump(exclude_none=True)
    if "camera_spec_id" in updates:
        camera_spec = await _get_camera_spec(updates.pop("camera_spec_id"))
        updates["camera_spec"] = camera_spec

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await camera_placement.set(updates)
        camera_placement = await _get_camera_placement_for_project(project, uid)

    return to_camera_placement_response(camera_placement)


@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera_placement(
    project_id: PydanticObjectId,
    uid: str,
    current_user: User = Depends(get_current_user),
) -> None:
    project = await _get_project_for_user(project_id, current_user)
    camera_placement = await _get_camera_placement_for_project(project, uid)
    await camera_placement.delete()
