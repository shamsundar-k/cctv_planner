from datetime import datetime, timezone
import logging

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.api_models.camera.camera_spec import CameraSpec, CameraSpecResponse
from app.db_schemas.camera_specification import CameraSpecification
from app.mappers.camera_spec_mapper import to_camera_spec_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/camera-specs", tags=["camera-specs"])


# create health check endpoint
@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint to verify that the camera spec router is operational."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.post("", response_model=CameraSpecResponse, status_code=status.HTTP_201_CREATED)
async def create_camera_spec(body: CameraSpec) -> CameraSpecResponse:
    camera_spec = CameraSpecification(**body.model_dump())

    try:
        await camera_spec.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera specification with this manufacturer and model already exists",
        )

    return to_camera_spec_response(camera_spec)

