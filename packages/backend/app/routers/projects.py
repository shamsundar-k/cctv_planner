"""Project router: CRUD for survey projects, plus collaborator management."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.camera_instance import CameraInstance
from app.models.project import CollaboratorRole, Project
from app.models.user import User
from app.models.zone import Zone
from app.schemas.project import (
    CameraInstanceSummary,
    CollaboratorAdd,
    CollaboratorResponse,
    ProjectCreate,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdate,
    ZoneSummary,
)

router = APIRouter(prefix="/projects", tags=["projects"])


# ── Access helpers ─────────────────────────────────────────────────────────────

def _owner_id(project: Project) -> str:
    return str(project.owner.ref.id)  # type: ignore[union-attr]


def _is_owner(project: Project, user: User) -> bool:
    return project.owner.ref.id == user.id  # type: ignore[union-attr]


def _can_access(project: Project, user: User) -> bool:
    return _is_owner(project, user) 


def _require_access(project: Project, user: User) -> None:
    if not _can_access(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _require_owner(project: Project, user: User) -> None:
    if not _is_owner(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can perform this action")


# ── Serialisers ────────────────────────────────────────────────────────────────

def _to_project_response(p: Project, camera_count: int = 0, zone_count: int = 0) -> ProjectResponse:
    return ProjectResponse(
        id=str(p.id),
        name=p.name,
        description=p.description,
        owner_id=_owner_id(p),
        center_lat=p.center_lat,
        center_lng=p.center_lng,
        default_zoom=p.default_zoom,
        camera_count=camera_count,
        zone_count=zone_count,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _to_camera_summary(cam: CameraInstance) -> CameraInstanceSummary:
    return CameraInstanceSummary(
        id=str(cam.id),
        label=cam.label,
        lat=cam.lat,
        lng=cam.lng,
        bearing=cam.bearing,
        height=cam.height,
        tilt_angle=cam.tilt_angle,
        focal_length_chosen=cam.focal_length_chosen,
        colour=cam.colour,
        visible=cam.visible,
        fov_geojson=cam.fov_geojson,
        camera_model_id=str(cam.camera_model.ref.id),  # type: ignore[union-attr]
        created_at=cam.created_at,
        updated_at=cam.updated_at,
    )


def _to_zone_summary(z: Zone) -> ZoneSummary:
    return ZoneSummary(
        id=str(z.id),
        label=z.label,
        zone_type=z.zone_type,
        colour=z.colour,
        visible=z.visible,
        geojson=z.geojson,
        created_at=z.created_at,
        updated_at=z.updated_at,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
) -> list[ProjectResponse]:
    user_id_str = str(current_user.id)
    is_admin = current_user.system_role == "admin"

    if is_admin:
        # Admin sees all projects
        projects = await Project.find_all().to_list()
    else:
        # Regular user: owned + collaborated projects
        owned = await Project.find(
            Project.owner.id == current_user.id  # type: ignore[union-attr]
        ).to_list()
        projects = owned

    # Fetch counts per project (<100 projects per spec so N queries is acceptable)
    result = []
    for p in projects:
        cam_count = await CameraInstance.find(
            CameraInstance.project.id == p.id  # type: ignore[union-attr]
        ).count()
        zone_count = await Zone.find(
            Zone.project.id == p.id  # type: ignore[union-attr]
        ).count()
        result.append(_to_project_response(p, cam_count, zone_count))
    return result


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    project = Project(
        name=body.name,
        description=body.description,
        center_lat=body.center_lat,
        center_lng=body.center_lng,
        default_zoom=body.default_zoom,
        owner=current_user,  # type: ignore[arg-type]
    )
    await project.insert()
    return _to_project_response(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> ProjectDetailResponse:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cameras = await CameraInstance.find(
        CameraInstance.project.id == project.id  # type: ignore[union-attr]
    ).to_list()
    zones = await Zone.find(
        Zone.project.id == project.id  # type: ignore[union-attr]
    ).to_list()

    base = _to_project_response(project, len(cameras), len(zones))
    return ProjectDetailResponse(
        **base.model_dump(),
        cameras=[_to_camera_summary(c) for c in cameras],
        zones=[_to_zone_summary(z) for z in zones],
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: PydanticObjectId,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    updates = body.model_dump(exclude_none=True)
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await project.set(updates)

    # Re-fetch counts after update
    cam_count = await CameraInstance.find(
        CameraInstance.project.id == project.id  # type: ignore[union-attr]
    ).count()
    zone_count = await Zone.find(
        Zone.project.id == project.id  # type: ignore[union-attr]
    ).count()

    return _to_project_response(project, cam_count, zone_count)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> None:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    # Cascade delete cameras and zones
    await CameraInstance.find(
        CameraInstance.project.id == project.id  # type: ignore[union-attr]
    ).delete()
    await Zone.find(
        Zone.project.id == project.id  # type: ignore[union-attr]
    ).delete()
    await project.delete()
