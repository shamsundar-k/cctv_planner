"""Camera model router: CRUD for reusable camera specs owned by the calling user."""

from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.deps import get_current_user, require_admin
from app.models.camera_model import CameraModel
from app.models.user import User
from app.schemas.camera_model import CameraModelCreate, CameraModelResponse, CameraModelUpdate
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/camera-models", tags=["camera-models"])


def _created_by_id(created_by) -> str:
    """Return the user ID string regardless of whether created_by is a
    populated User document or an unresolved Beanie Link (DBRef)."""
    if isinstance(created_by, User):
        return str(created_by.id)
    return str(created_by.ref.id)  # Link object returned when not fetched


def _to_response(m: CameraModel) -> CameraModelResponse:
    return CameraModelResponse(
        id=str(m.id),
        name=m.name,
        manufacturer=m.manufacturer,
        model_number=m.model_number,
        camera_type=m.camera_type,
        location=m.location,
        notes=m.notes,
        focal_length_min=m.focal_length_min,
        focal_length_max=m.focal_length_max,
        h_fov_min=m.h_fov_min,
        h_fov_max=m.h_fov_max,
        v_fov_min=m.v_fov_min,
        v_fov_max=m.v_fov_max,
        lens_type=m.lens_type,
        ir_cut_filter=m.ir_cut_filter,
        ir_range=m.ir_range,
        resolution_h=m.resolution_h,
        resolution_v=m.resolution_v,
        megapixels=m.megapixels,
        aspect_ratio=m.aspect_ratio,
        sensor_size=m.sensor_size,
        sensor_type=m.sensor_type,
        min_illumination=m.min_illumination,
        wdr=m.wdr,
        wdr_db=m.wdr_db,
        created_by=_created_by_id(m.created_by),
        created_at=m.created_at,
        updated_at=m.updated_at,
    )


@router.get("", response_model=list[CameraModelResponse])
async def list_camera_models(
    current_user: User = Depends(get_current_user),
) -> list[CameraModelResponse]:
    """List all camera models. All authenticated users can read; write operations require admin."""
    models = await CameraModel.find_all().to_list()
    return [_to_response(m) for m in models]


@router.post("", response_model=CameraModelResponse, status_code=status.HTTP_201_CREATED)
async def create_camera_model(
    body: CameraModelCreate,
    current_user: User = Depends(require_admin),
) -> CameraModelResponse:
    model = CameraModel(
        name=body.name,
        manufacturer=body.manufacturer,
        model_number=body.model_number,
        camera_type=body.camera_type,
        location=body.location,
        notes=body.notes,
        focal_length_min=body.focal_length_min,
        focal_length_max=body.focal_length_max,
        h_fov_min=body.h_fov_min,
        h_fov_max=body.h_fov_max,
        v_fov_min=body.v_fov_min,
        v_fov_max=body.v_fov_max,
        lens_type=body.lens_type,
        ir_cut_filter=body.ir_cut_filter,
        ir_range = body.ir_range,
        resolution_h=body.resolution_h,
        resolution_v=body.resolution_v,
        megapixels=body.megapixels,
        aspect_ratio=body.aspect_ratio,
        sensor_size=body.sensor_size,
        sensor_type=body.sensor_type,
        min_illumination=body.min_illumination,
        wdr=body.wdr,
        wdr_db=body.wdr_db,
        created_by=current_user,  # type: ignore[arg-type]
    )
    
    
    try:
        await model.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a camera model with this name",
        )
    return _to_response(model)


@router.get("/{model_id}", response_model=CameraModelResponse)
async def get_camera_model(
    model_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> CameraModelResponse:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")
    return _to_response(model)


@router.put("/{model_id}", response_model=CameraModelResponse)
async def update_camera_model(
    model_id: PydanticObjectId,
    body: CameraModelUpdate,
    current_user: User = Depends(require_admin),
) -> CameraModelResponse:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")

    updates = body.model_dump(exclude_none=True)
    if updates:
        # Validate merged document state before persisting.
        updates["updated_at"] = datetime.now(timezone.utc)
        merged = model.model_copy(update=updates)
        try:
            CameraModel.model_validate(merged.model_dump())
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
        await model.set(updates)

    return _to_response(model)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera_model(
    model_id: PydanticObjectId,
    current_user: User = Depends(require_admin),
) -> None:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")
    await model.delete()
