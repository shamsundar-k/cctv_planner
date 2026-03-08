"""Project router: CRUD for survey projects, plus collaborator management."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from beanie.operators import In
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


def _collaborator_role(project: Project, user: User) -> CollaboratorRole | None:
    for entry in project.collaborators:
        if entry.get("user_id") == str(user.id):
            return entry.get("role")
    return None


def _can_access(project: Project, user: User) -> bool:
    return _is_owner(project, user) or _collaborator_role(project, user) is not None


def _require_access(project: Project, user: User) -> None:
    if not _can_access(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _require_owner(project: Project, user: User) -> None:
    if not _is_owner(project, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can perform this action")


# ── Serialisers ────────────────────────────────────────────────────────────────

def _to_project_response(p: Project) -> ProjectResponse:
    return ProjectResponse(
        id=str(p.id),
        name=p.name,
        description=p.description,
        owner_id=_owner_id(p),
        collaborators=[CollaboratorResponse(**c) for c in p.collaborators],
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

    # Projects owned by user
    owned = await Project.find(
        Project.owner.id == current_user.id  # type: ignore[union-attr]
    ).to_list()

    # Projects where user is a collaborator (stored as dict list)
    # We fetch all and filter in Python to avoid complex MongoDB query on mixed list[dict]
    all_projects = await Project.find_all().to_list()
    collaborated = [
        p for p in all_projects
        if not _is_owner(p, current_user) and any(
            c.get("user_id") == user_id_str for c in p.collaborators
        )
    ]

    return [_to_project_response(p) for p in owned + collaborated]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    project = Project(
        name=body.name,
        description=body.description,
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

    base = _to_project_response(project)
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

    return _to_project_response(project)


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


@router.post("/{project_id}/collaborators", response_model=ProjectResponse)
async def add_collaborator(
    project_id: PydanticObjectId,
    body: CollaboratorAdd,
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    # Verify the target user exists
    target_user = await User.get(PydanticObjectId(body.user_id))
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if body.user_id == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner cannot be added as collaborator")

    # Update existing entry or append
    collaborators = list(project.collaborators)
    for entry in collaborators:
        if entry.get("user_id") == body.user_id:
            entry["role"] = body.role
            break
    else:
        collaborators.append({"user_id": body.user_id, "role": body.role})

    await project.set({"collaborators": collaborators, "updated_at": datetime.now(timezone.utc)})
    return _to_project_response(project)


@router.delete("/{project_id}/collaborators/{user_id}", response_model=ProjectResponse)
async def remove_collaborator(
    project_id: PydanticObjectId,
    user_id: str,
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    collaborators = [c for c in project.collaborators if c.get("user_id") != user_id]
    if len(collaborators) == len(project.collaborators):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaborator not found")

    await project.set({"collaborators": collaborators, "updated_at": datetime.now(timezone.utc)})
    return _to_project_response(project)
