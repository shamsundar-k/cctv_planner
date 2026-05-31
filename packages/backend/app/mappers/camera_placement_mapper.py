from app.api_models.camera.camera_placement import CameraPlacementResponse
from app.db_schemas.camera_placement import CameraPlacementDocument
from app.db_schemas.camera_specification import CameraSpecification


def _camera_spec_id(camera_placement: CameraPlacementDocument) -> str:
    camera_spec = camera_placement.camera_spec
    if isinstance(camera_spec, CameraSpecification):
        return str(camera_spec.id)
    return str(camera_spec.ref.id)  # type: ignore[union-attr]


def to_camera_placement_response(
    camera_placement: CameraPlacementDocument,
) -> CameraPlacementResponse:
    return CameraPlacementResponse(
        uid=camera_placement.uid,
        camera_spec_id=_camera_spec_id(camera_placement),
        location=camera_placement.location,
        height=camera_placement.height,
        bearing=camera_placement.bearing,
        label=camera_placement.label,
        color=camera_placement.color,
        created_at=camera_placement.created_at,
        updated_at=camera_placement.updated_at,
    )
