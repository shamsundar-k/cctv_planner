"""Project router: CRUD for survey projects."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.camera_instance import CameraInstance
from app.models.project import Project
from app.models.user import User
from app.models.zone import Zone
from app.models.camera_model import CameraModel
from app.schemas.camera_model import CameraModelResponse
from app.schemas.camera_instance import CameraInstanceCreate, CameraInstanceUpdate
from app.schemas.project import (
    CameraInstanceSummary,
    ImportedCameraItem,
    ProjectCreate,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdate,
    ZoneSummary,
)

router = APIRouter(prefix="/projects", tags=["projects"])


# ── Access helpers ─────────────────────────────────────────────────────────────

def _owner_id(project: Project) -> str:
    owner = project.owner
    if isinstance(owner, User):
        return str(owner.id)
    return str(owner.ref.id)  # type: ignore[union-attr]


def _is_owner(project: Project, user: User) -> bool:
    owner = project.owner
    if isinstance(owner, User):
        return owner.id == user.id
    return owner.ref.id == user.id  # type: ignore[union-attr]


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
        imported_camera_model_count=len(p.imported_camera_model_ids),
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _camera_model_id(cam: CameraInstance) -> str:
    cm = cam.camera_model
    if isinstance(cm, CameraModel):
        return str(cm.id)
    return str(cm.ref.id)  # type: ignore[union-attr]


def _to_camera_summary(cam: CameraInstance) -> CameraInstanceSummary:
    return CameraInstanceSummary(
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
    existing = await Project.find_one(
        Project.owner.id == current_user.id,  # type: ignore[union-attr]
        Project.name == body.name,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A project named '{body.name}' already exists.",
        )

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


# ── Camera-model import sub-resource ───────────────────────────────────────────

def _to_camera_model_response(cm: CameraModel) -> CameraModelResponse:
    return CameraModelResponse(
        id=str(cm.id),
        name=cm.name,
        manufacturer=cm.manufacturer,
        model_number=cm.model_number,
        camera_type=cm.camera_type,
        location=cm.location,
        notes=cm.notes,
        focal_length_min=cm.focal_length_min,
        focal_length_max=cm.focal_length_max,
        h_fov_min=cm.h_fov_min,
        h_fov_max=cm.h_fov_max,
        v_fov_min=cm.v_fov_min,
        v_fov_max=cm.v_fov_max,
        lens_type=cm.lens_type,
        ir_cut_filter=cm.ir_cut_filter,
        ir_range=cm.ir_range,
        resolution_h=cm.resolution_h,
        resolution_v=cm.resolution_v,
        megapixels=cm.megapixels,
        aspect_ratio=cm.aspect_ratio,
        sensor_size=cm.sensor_size,
        sensor_type=cm.sensor_type,
        min_illumination=cm.min_illumination,
        wdr=cm.wdr,
        wdr_db=cm.wdr_db,
        created_by=str(cm.created_by),
        created_at=cm.created_at,
        updated_at=cm.updated_at,
    )


@router.get("/{project_id}/camera-models", response_model=list[ImportedCameraItem])
async def list_imported_cameras(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> list[ImportedCameraItem]:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    result = []
    for model_id in project.imported_camera_model_ids:
        cm = await CameraModel.get(model_id)
        if cm is None:
            continue
        placed_count = await CameraInstance.find(
            CameraInstance.project.id == project.id,  # type: ignore[union-attr]
            CameraInstance.camera_model.id == model_id,  # type: ignore[union-attr]
        ).count()
        result.append(ImportedCameraItem(
            camera_model=_to_camera_model_response(cm),
            placed_count=placed_count,
        ))
    return result


@router.post("/{project_id}/camera-models/{model_id}", response_model=ImportedCameraItem, status_code=status.HTTP_201_CREATED)
async def add_imported_camera(
    project_id: PydanticObjectId,
    model_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> ImportedCameraItem:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    cm = await CameraModel.get(model_id)
    if cm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")

    if model_id in project.imported_camera_model_ids:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Camera model already imported")

    project.imported_camera_model_ids.append(model_id)
    project.updated_at = datetime.now(timezone.utc)
    await project.save()

    return ImportedCameraItem(camera_model=_to_camera_model_response(cm), placed_count=0)


@router.delete("/{project_id}/camera-models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_imported_camera(
    project_id: PydanticObjectId,
    model_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> None:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_owner(project, current_user)

    if model_id not in project.imported_camera_model_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not imported")

    placed_count = await CameraInstance.find(
        CameraInstance.project.id == project.id,  # type: ignore[union-attr]
        CameraInstance.camera_model.id == model_id,  # type: ignore[union-attr]
    ).count()
    if placed_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot remove: {placed_count} camera instance(s) use this model in the project",
        )

    project.imported_camera_model_ids.remove(model_id)
    project.updated_at = datetime.now(timezone.utc)
    await project.save()


# ── Camera instance sub-resource ───────────────────────────────────────────────

async def _get_camera_for_project(
    project_id: PydanticObjectId,
    client_id: str,
    current_user: User,
) -> tuple[Project, CameraInstance]:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cam = await CameraInstance.find_one(
        CameraInstance.project.id == project.id,  # type: ignore[union-attr]
        CameraInstance.client_id == client_id,
    )
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera instance not found")

    return project, cam


@router.get("/{project_id}/cameras", response_model=list[CameraInstanceSummary])
async def list_camera_instances(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> list[CameraInstanceSummary]:
    project = await Project.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    _require_access(project, current_user)

    cameras = await CameraInstance.find(
        CameraInstance.project.id == project.id  # type: ignore[union-attr]
    ).to_list()
    return [_to_camera_summary(c) for c in cameras]


@router.post("/{project_id}/cameras", response_model=CameraInstanceSummary, status_code=status.HTTP_201_CREATED)
async def place_camera_instance(
    project_id: PydanticObjectId,
    body: CameraInstanceCreate,
    current_user: User = Depends(get_current_user),
) -> CameraInstanceSummary:
    project = await Project.get(project_id)
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

    if model_id not in project.imported_camera_model_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera model not imported into this project",
        )

    # Re-instantiate with ir_range_hint so the validator can default target_distance
    body = CameraInstanceCreate(
        **body.model_dump(exclude={"ir_range_hint"}),
        ir_range_hint=cm.ir_range,
    )

    instance = CameraInstance(
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


@router.get("/{project_id}/cameras/{client_id}", response_model=CameraInstanceSummary)
async def get_camera_instance(
    project_id: PydanticObjectId,
    client_id: str,
    current_user: User = Depends(get_current_user),
) -> CameraInstanceSummary:
    _, cam = await _get_camera_for_project(project_id, client_id, current_user)
    return _to_camera_summary(cam)


@router.put("/{project_id}/cameras/{client_id}", response_model=CameraInstanceSummary)
async def update_camera_instance(
    project_id: PydanticObjectId,
    client_id: str,
    body: CameraInstanceUpdate,
    current_user: User = Depends(get_current_user),
) -> CameraInstanceSummary:
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
