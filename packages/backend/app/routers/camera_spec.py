from datetime import datetime, timezone
import logging

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from pymongo.errors import DuplicateKeyError
from app.core.deps import get_current_user
from app.db_schemas.user import User
from app.api_models.camera.camera_spec import CameraSpec, CameraSpecRecord, CameraSpecUpdate
from app.db_schemas.camera_specification import CameraSpecification
from app.mappers.camera_spec_mapper import to_camera_spec_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/camera-specs", tags=["camera-specs"])


# create health check endpoint
@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint to verify that the camera spec router is operational."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("", response_model=list[CameraSpecRecord])
async def list_camera_specs(current_user: User = Depends(get_current_user),) -> list[CameraSpecRecord]:
    camera_specs = await CameraSpecification.find_all().to_list()
    return [to_camera_spec_record(camera_spec) for camera_spec in camera_specs]


@router.post("", response_model=CameraSpecRecord, status_code=status.HTTP_201_CREATED)
async def create_camera_spec(body: CameraSpec, current_user: User = Depends(get_current_user),) -> CameraSpecRecord:
    camera_spec = CameraSpecification(**body.model_dump())

    try:
        await camera_spec.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera specification with this manufacturer and model already exists",
        )

    return to_camera_spec_record(camera_spec)


@router.get("/{camera_spec_id}", response_model=CameraSpecRecord)
async def get_camera_spec(
    camera_spec_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> CameraSpecRecord:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    return to_camera_spec_record(camera_spec)


@router.put("/{camera_spec_id}", response_model=CameraSpecRecord)
async def update_camera_spec(
    camera_spec_id: PydanticObjectId,
    body: CameraSpecUpdate,
    current_user: User = Depends(get_current_user),
) -> CameraSpecRecord:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    updates = body.model_dump(exclude_none=True)
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        merged = camera_spec.model_copy(update=updates)
        try:
            CameraSpecification.model_validate(merged.model_dump())
            await camera_spec.set(updates)
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Camera specification with this manufacturer and model already exists",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )

    return to_camera_spec_record(camera_spec)


@router.delete("/{camera_spec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera_spec(camera_spec_id: PydanticObjectId,current_user: User = Depends(get_current_user),) -> None:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    await camera_spec.delete()
