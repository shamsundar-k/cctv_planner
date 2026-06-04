from app.api_models.camera.camera_spec import CameraSpecRecord
from app.db_schemas.camera_specification import CameraSpecification


def to_camera_spec_record(camera_spec: CameraSpecification) -> CameraSpecRecord:
    return CameraSpecRecord(
        id=str(camera_spec.id),
        name=camera_spec.name,
        manufacturer=camera_spec.manufacturer,
        model=camera_spec.model,
        camera_type=camera_spec.camera_type,
        lens_spec=camera_spec.lens_spec,
        sensor_spec=camera_spec.sensor_spec,
        ir_range=camera_spec.ir_range,
        created_at=camera_spec.created_at,
        updated_at=camera_spec.updated_at,
    )
