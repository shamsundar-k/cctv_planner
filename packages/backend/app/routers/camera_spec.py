from datetime import datetime, timezone
import logging

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool
from app.core.deps import get_current_user
from app.db_schemas.user import User
from app.api_models.camera.camera_spec import CameraSpec, CameraSpecCreate, CameraSpecRecord, CameraSpecUpdate
from app.db_schemas.camera_specification import CameraSpecification
from app.mappers.camera_spec_mapper import to_camera_spec_record
from app.services.camera_spec_image_service import (
    CameraImageValidationError,
    camera_spec_image_service,
)

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
async def create_camera_spec(body: CameraSpecCreate, current_user: User = Depends(get_current_user),) -> CameraSpecRecord:
    if body.id is not None and await CameraSpecification.get(PydanticObjectId(body.id)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera specification ID already exists",
        )

    camera_spec_data = body.model_dump(exclude={"id"})
    camera_spec = (
        CameraSpecification(id=PydanticObjectId(body.id), **camera_spec_data)
        if body.id is not None
        else CameraSpecification(**camera_spec_data)
    )

    try:
        await camera_spec.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera specification ID or manufacturer and model already exists",
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


@router.get("/{camera_spec_id}/image", response_class=FileResponse)
async def get_camera_spec_image(camera_spec_id: PydanticObjectId) -> FileResponse:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    camera_spec_id_string = str(camera_spec_id)
    custom_path = camera_spec_image_service.custom_path(camera_spec_id_string)
    if camera_spec.image_storage_key and custom_path.is_file():
        image_path = custom_path
    else:
        if camera_spec.image_storage_key:
            logger.warning(
                "Camera specification %s references a missing custom image",
                camera_spec_id_string,
            )
        image_path = camera_spec_image_service.default_path(camera_spec.camera_type)

    if not image_path.is_file():
        logger.error("Configured camera image is missing: %s", image_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Camera image is unavailable",
        )

    return FileResponse(
        image_path,
        media_type="image/webp",
        headers={
            "Cache-Control": "public, max-age=300",
            "Content-Disposition": f'inline; filename="{image_path.name}"',
        },
    )


@router.put("/{camera_spec_id}/image", response_model=CameraSpecRecord)
async def replace_camera_spec_image(
    camera_spec_id: PydanticObjectId,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> CameraSpecRecord:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    content = await image.read(camera_spec_image_service.max_upload_bytes + 1)
    await image.close()
    try:
        storage_key = await run_in_threadpool(
            camera_spec_image_service.store,
            str(camera_spec_id),
            content,
        )
    except CameraImageValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except OSError as exc:
        logger.exception("Failed to store image for camera specification %s", camera_spec_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Camera image could not be stored",
        ) from exc

    now = datetime.now(timezone.utc)
    await camera_spec.set(
        {
            "image_storage_key": storage_key,
            "image_version": camera_spec.image_version + 1,
            "image_updated_at": now,
            "updated_at": now,
        }
    )
    return to_camera_spec_record(camera_spec)


@router.delete("/{camera_spec_id}/image", response_model=CameraSpecRecord)
async def remove_camera_spec_image(
    camera_spec_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> CameraSpecRecord:
    camera_spec = await CameraSpecification.get(camera_spec_id)
    if camera_spec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera specification not found",
        )

    try:
        await run_in_threadpool(camera_spec_image_service.remove, str(camera_spec_id))
    except OSError as exc:
        logger.exception("Failed to remove image for camera specification %s", camera_spec_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Camera image could not be removed",
        ) from exc

    now = datetime.now(timezone.utc)
    await camera_spec.set(
        {
            "image_storage_key": None,
            "image_version": camera_spec.image_version + 1,
            "image_updated_at": now,
            "updated_at": now,
        }
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
    try:
        await run_in_threadpool(camera_spec_image_service.remove, str(camera_spec_id))
    except OSError:
        logger.exception("Failed to clean up image for deleted camera specification %s", camera_spec_id)
