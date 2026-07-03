"""Project router: CRUD for survey projects."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api_models.project import (
    Project as ProjectPayload,
    ProjectRecord,
    ProjectUpdate,
)
from app.core.deps import get_current_user
from app.db_schemas.camera_placement import CameraPlacementDocument
from app.db_schemas.project import Project as ProjectDocument
from app.db_schemas.user import User

router = APIRouter(prefix="/projects", tags=["projects"])


# ── Access helpers ─────────────────────────────────────────────────────────────

def _created_by_id(project: ProjectDocument) -> str:
    created_by = project.created_by
    if isinstance(created_by, User):
        return str(created_by.id)
    return str(created_by.ref.id)  # type: ignore[union-attr]


def _is_creator(project: ProjectDocument, user: User) -> bool:
    created_by = project.created_by
    if isinstance(created_by, User):
        return created_by.id == user.id
    return created_by.ref.id == user.id  # type: ignore[union-attr]


def _can_access(project: ProjectDocument, user: User) -> bool:
    return _is_creator(project, user)


def _require_access(project: ProjectDocument, user: User) -> None:
    if not _can_access(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _require_creator(project: ProjectDocument, user: User) -> None:
    if not _is_creator(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project creator can perform this action")


# ── Serialisers ────────────────────────────────────────────────────────────────

def _to_project_record(p: ProjectDocument, camera_count: int = 0) -> ProjectRecord:
    return ProjectRecord(
        id=str(p.id),
        name=p.name,
        description=p.description,
        created_by_id=_created_by_id(p),
        center_lat=p.center_lat,
        center_lng=p.center_lng,
        default_zoom=p.default_zoom,
        camera_count=camera_count,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProjectRecord])
async def list_projects(
    current_user: User = Depends(get_current_user),
) -> list[ProjectRecord]:
    projects = await ProjectDocument.find(
        ProjectDocument.created_by.id == current_user.id  # type: ignore[union-attr]
    ).to_list()

    # Fetch counts per project (<100 projects per spec so N queries is acceptable)
    result = []
    for p in projects:
        cam_count = await CameraPlacementDocument.find(
            CameraPlacementDocument.project.id == p.id  # type: ignore[union-attr]
        ).count()
        result.append(_to_project_record(p, cam_count))
    return result


@router.post("", response_model=ProjectRecord, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectPayload,
    current_user: User = Depends(get_current_user),
) -> ProjectRecord:
    existing = await ProjectDocument.find_one(
        ProjectDocument.created_by.id == current_user.id,  # type: ignore[union-attr]
        ProjectDocument.name == body.name,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A project named '{body.name}' already exists.",
        )

    project = ProjectDocument(
        name=body.name,
        description=body.description,
        center_lat=body.center_lat,
        center_lng=body.center_lng,
        default_zoom=body.default_zoom,
        created_by=current_user,  # type: ignore[arg-type]
    )
    await project.insert()
    return _to_project_record(project)


@router.get("/{project_id}", response_model=ProjectRecord)
async def get_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> ProjectRecord:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cam_count = await CameraPlacementDocument.find(
        CameraPlacementDocument.project.id == project.id  # type: ignore[union-attr]
    ).count()
    return _to_project_record(project, cam_count)


@router.put("/{project_id}", response_model=ProjectRecord)
async def update_project(
    project_id: PydanticObjectId,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
) -> ProjectRecord:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_creator(project, current_user)

    updates = body.model_dump(exclude_none=True)
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await project.set(updates)

    # Re-fetch counts after update
    cam_count = await CameraPlacementDocument.find(
        CameraPlacementDocument.project.id == project.id  # type: ignore[union-attr]
    ).count()

    return _to_project_record(project, cam_count)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> None:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_creator(project, current_user)

    # Cascade delete camera placements
    await CameraPlacementDocument.find(
        CameraPlacementDocument.project.id == project.id  # type: ignore[union-attr]
    ).delete()
    await project.delete()
