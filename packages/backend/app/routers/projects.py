"""Project router: CRUD for survey projects."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api_models.project import (
    CameraSummary,
    Project as ProjectPayload,
    ProjectDetailRecord,
    ProjectRecord,
    ProjectUpdate,
)
from app.core.deps import get_current_user
from app.models.camera import Camera
from app.models.project import Project as ProjectDocument
from app.models.user import User
from app.models.camera_model import CameraModel
from app.schemas.camera import CameraCreate, CameraUpdate

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


def _camera_model_id(cam: Camera) -> str:
    cm = cam.camera_model
    if isinstance(cm, CameraModel):
        return str(cm.id)
    return str(cm.ref.id)  # type: ignore[union-attr]


def _to_camera_summary(cam: Camera) -> CameraSummary:
    return CameraSummary(
        id=str(cam.id),
        client_id=cam.client_id,
        label=cam.label,
        lat=cam.lat,
        lng=cam.lng,
        bearing=cam.bearing,
        camera_height=cam.camera_height,
        tilt_angle=cam.tilt_angle,
        focal_length_chosen=cam.focal_length_chosen,
        colour=cam.colour,
        visible=cam.visible,
        fov_visible_geojson=cam.fov_visible_geojson,
        fov_ir_geojson=cam.fov_ir_geojson,
        target_distance=cam.target_distance,
        target_height=cam.target_height,
        camera_model_id=_camera_model_id(cam),
        created_at=cam.created_at,
        updated_at=cam.updated_at,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProjectRecord])
async def list_projects(
    current_user: User = Depends(get_current_user),
) -> list[ProjectRecord]:
    is_admin = current_user.system_role == "admin"

    if is_admin:
        # Admin sees all projects
        projects = await ProjectDocument.find_all().to_list()
    else:
        # Regular user: created projects
        owned = await ProjectDocument.find(
            ProjectDocument.created_by.id == current_user.id  # type: ignore[union-attr]
        ).to_list()
        projects = owned

    # Fetch counts per project (<100 projects per spec so N queries is acceptable)
    result = []
    for p in projects:
        cam_count = await Camera.find(
            Camera.project.id == p.id  # type: ignore[union-attr]
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


@router.get("/{project_id}", response_model=ProjectDetailRecord)
async def get_project(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> ProjectDetailRecord:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cameras = await Camera.find(
        Camera.project.id == project.id  # type: ignore[union-attr]
    ).to_list()

    base = _to_project_record(project, len(cameras))
    return ProjectDetailRecord(
        **base.model_dump(),
        cameras=[_to_camera_summary(c) for c in cameras],
    )


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
    cam_count = await Camera.find(
        Camera.project.id == project.id  # type: ignore[union-attr]
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

    # Cascade delete cameras
    await Camera.find(
        Camera.project.id == project.id  # type: ignore[union-attr]
    ).delete()
    await project.delete()


# ── Camera instance sub-resource ───────────────────────────────────────────────

async def _get_camera_for_project(
    project_id: PydanticObjectId,
    client_id: str,
    current_user: User,
) -> tuple[ProjectDocument, Camera]:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cam = await Camera.find_one(
        Camera.project.id == project.id,  # type: ignore[union-attr]
        Camera.client_id == client_id,
    )
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera instance not found")

    return project, cam


@router.get("/{project_id}/cameras", response_model=list[CameraSummary])
async def list_camera_instances(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> list[CameraSummary]:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cameras = await Camera.find(
        Camera.project.id == project.id  # type: ignore[union-attr]
    ).to_list()
    return [_to_camera_summary(c) for c in cameras]


@router.post("/{project_id}/cameras", response_model=CameraSummary, status_code=status.HTTP_201_CREATED)
async def place_camera_instance(
    project_id: PydanticObjectId,
    body: CameraCreate,
    current_user: User = Depends(get_current_user),
) -> CameraSummary:
    project = await ProjectDocument.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    try:
        model_id = PydanticObjectId(body.camera_model_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid camera_model_id")

    cm = await CameraModel.get(model_id)
    if cm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")

    # Re-instantiate with ir_range_hint so the validator can default target_distance
    body = CameraCreate(
        **body.model_dump(exclude={"ir_range_hint"}),
        ir_range_hint=cm.ir_range,
    )

    instance = Camera(
        client_id=body.client_id,
        project=project,  # type: ignore[arg-type]
        camera_model=cm,  # type: ignore[arg-type]
        label=body.label,
        lat=body.lat,
        lng=body.lng,
        bearing=body.bearing,
        camera_height=body.camera_height,
        tilt_angle=body.tilt_angle,
        focal_length_chosen=body.focal_length_chosen,
        colour=body.colour,
        visible=body.visible,
        fov_visible_geojson=body.fov_visible_geojson,
        fov_ir_geojson=body.fov_ir_geojson,
        target_distance=body.target_distance,
        target_height=body.target_height,
    )
    await instance.insert()
    return _to_camera_summary(instance)


@router.get("/{project_id}/cameras/{client_id}", response_model=CameraSummary)
async def get_camera_instance(
    project_id: PydanticObjectId,
    client_id: str,
    current_user: User = Depends(get_current_user),
) -> CameraSummary:
    _, cam = await _get_camera_for_project(project_id, client_id, current_user)
    return _to_camera_summary(cam)


@router.put("/{project_id}/cameras/{client_id}", response_model=CameraSummary)
async def update_camera_instance(
    project_id: PydanticObjectId,
    client_id: str,
    body: CameraUpdate,
    current_user: User = Depends(get_current_user),
) -> CameraSummary:
    _, cam = await _get_camera_for_project(project_id, client_id, current_user)

    updates = body.model_dump(exclude_none=True, exclude={"ir_range_hint"})
    if "target_distance" not in updates and body.ir_range_hint > 0:
        updates["target_distance"] = body.ir_range_hint
    updates["updated_at"] = datetime.now(timezone.utc)

    if updates:
        await cam.set(updates)
    return _to_camera_summary(cam)


@router.delete("/{project_id}/cameras/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera_instance(
    project_id: PydanticObjectId,
    client_id: str,
    current_user: User = Depends(get_current_user),
) -> None:
    _, cam = await _get_camera_for_project(project_id, client_id, current_user)
    await cam.delete()
