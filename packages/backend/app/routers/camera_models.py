"""Camera model router: CRUD for reusable camera specs owned by the calling user."""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.camera_model import CameraModel
from app.models.user import User
from app.schemas.camera_model import CameraModelCreate, CameraModelResponse, CameraModelUpdate

router = APIRouter(prefix="/camera-models", tags=["camera-models"])


def _to_response(m: CameraModel) -> CameraModelResponse:
    return CameraModelResponse(
        id=str(m.id),
        name=m.name,
        manufacturer=m.manufacturer,
        fov_angle=m.fov_angle,
        min_range=m.min_range,
        max_range=m.max_range,
        created_by=str(m.created_by.ref.id),  # type: ignore[union-attr]
        created_at=m.created_at,
    )


@router.get("", response_model=list[CameraModelResponse])
async def list_camera_models(
    current_user: User = Depends(get_current_user),
) -> list[CameraModelResponse]:
    models = await CameraModel.find(
        CameraModel.created_by.id == current_user.id  # type: ignore[union-attr]
    ).to_list()
    return [_to_response(m) for m in models]


@router.post("", response_model=CameraModelResponse, status_code=status.HTTP_201_CREATED)
async def create_camera_model(
    body: CameraModelCreate,
    current_user: User = Depends(get_current_user),
) -> CameraModelResponse:
    model = CameraModel(
        name=body.name,
        manufacturer=body.manufacturer,
        fov_angle=body.fov_angle,
        min_range=body.min_range,
        max_range=body.max_range,
        created_by=current_user,  # type: ignore[arg-type]
    )
    await model.insert()
    return _to_response(model)


@router.get("/{model_id}", response_model=CameraModelResponse)
async def get_camera_model(
    model_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> CameraModelResponse:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")
    if model.created_by.ref.id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return _to_response(model)


@router.put("/{model_id}", response_model=CameraModelResponse)
async def update_camera_model(
    model_id: PydanticObjectId,
    body: CameraModelUpdate,
    current_user: User = Depends(get_current_user),
) -> CameraModelResponse:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")
    if model.created_by.ref.id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    updates = body.model_dump(exclude_none=True)
    if updates:
        await model.set(updates)

    return _to_response(model)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera_model(
    model_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> None:
    model = await CameraModel.get(model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera model not found")
    if model.created_by.ref.id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await model.delete()
