from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

from beanie import PydanticObjectId
from fastapi import HTTPException, UploadFile
from pydantic import ValidationError
from PIL import Image
import pytest

from app.api_models.camera.camera_spec import CameraSpecCreate, CameraType
from app.routers import camera_spec
from app.services.camera_spec_image_service import CameraSpecImageService

CAMERA_SPEC_ID = PydanticObjectId("66584aef0f5f3e6d8f8a1234")


@pytest.fixture
def service(tmp_path: Path) -> CameraSpecImageService:
    image_service = CameraSpecImageService(
        tmp_path,
        max_upload_bytes=5 * 1024 * 1024,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )
    defaults = tmp_path / "defaults"
    defaults.mkdir()
    for filename in ("dome.webp", "bullet.webp", "ptz.webp"):
        Image.new("RGB", (100, 100), "gray").save(defaults / filename, "WEBP")
    return image_service


@pytest.mark.parametrize("camera_type", list(CameraType))
async def test_get_image_returns_type_default(
    monkeypatch: pytest.MonkeyPatch,
    service: CameraSpecImageService,
    camera_type: CameraType,
) -> None:
    record = SimpleNamespace(camera_type=camera_type, image_storage_key=None)
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=record))
    monkeypatch.setattr(camera_spec, "camera_spec_image_service", service)

    response = await camera_spec.get_camera_spec_image(CAMERA_SPEC_ID)

    assert Path(response.path) == service.default_path(camera_type)
    assert response.media_type == "image/webp"


async def test_get_image_falls_back_when_custom_metadata_file_is_missing(
    monkeypatch: pytest.MonkeyPatch,
    service: CameraSpecImageService,
) -> None:
    record = SimpleNamespace(camera_type=CameraType.DOME, image_storage_key="custom/missing.webp")
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=record))
    monkeypatch.setattr(camera_spec, "camera_spec_image_service", service)

    response = await camera_spec.get_camera_spec_image(CAMERA_SPEC_ID)

    assert Path(response.path) == service.default_path(CameraType.DOME)


async def test_get_image_returns_custom_image(
    monkeypatch: pytest.MonkeyPatch,
    service: CameraSpecImageService,
) -> None:
    custom_path = service.custom_path(str(CAMERA_SPEC_ID))
    custom_path.parent.mkdir()
    Image.new("RGB", (100, 100), "blue").save(custom_path, "WEBP")
    record = SimpleNamespace(camera_type=CameraType.DOME, image_storage_key=service.storage_key(str(CAMERA_SPEC_ID)))
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=record))
    monkeypatch.setattr(camera_spec, "camera_spec_image_service", service)

    response = await camera_spec.get_camera_spec_image(CAMERA_SPEC_ID)

    assert Path(response.path) == custom_path


async def test_get_image_returns_404_for_missing_specification(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=None))

    with pytest.raises(HTTPException) as error:
        await camera_spec.get_camera_spec_image(CAMERA_SPEC_ID)

    assert error.value.status_code == 404



def valid_camera_spec_payload() -> dict[str, object]:
    return {
        "name": "Test Camera",
        "manufacturer": "Test Manufacturer",
        "model": "Test Model",
        "camera_type": "dome",
        "lens_spec": {
            "lens_type": "fixed",
            "focal_length": {"min": 2.8, "max": 2.8},
            "h_fov": {"min": 100, "max": 100},
            "v_fov": {"min": 60, "max": 60},
        },
        "sensor_spec": {
            "resolution": {"horizontal": 1920, "vertical": 1080},
        },
        "ir_range": 30,
    }


@pytest.mark.parametrize("invalid_id", ["short", "../unsafe-camera-spec", "g" * 24])
def test_create_model_rejects_invalid_client_generated_id(invalid_id: str) -> None:
    with pytest.raises(ValidationError):
        CameraSpecCreate(id=invalid_id, **valid_camera_spec_payload())


async def test_create_rejects_duplicate_client_generated_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    body = CameraSpecCreate(id=str(CAMERA_SPEC_ID), **valid_camera_spec_payload())
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=object()))

    with pytest.raises(HTTPException) as error:
        await camera_spec.create_camera_spec(body)

    assert error.value.status_code == 409



class FakeCameraRecord(SimpleNamespace):
    async def set(self, updates: dict[str, object]) -> None:
        for key, value in updates.items():
            setattr(self, key, value)


def upload_image() -> UploadFile:
    content = BytesIO()
    Image.new("RGB", (120, 120), "blue").save(content, "JPEG")
    content.seek(0)
    return UploadFile(file=content, filename="../unsafe-name.jpg", headers={"content-type": "image/jpeg"})


async def test_replace_image_increments_version_and_ignores_filename(
    monkeypatch: pytest.MonkeyPatch,
    service: CameraSpecImageService,
) -> None:
    record = FakeCameraRecord(
        camera_type=CameraType.DOME,
        image_storage_key=None,
        image_version=2,
    )
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=record))
    monkeypatch.setattr(camera_spec, "camera_spec_image_service", service)
    monkeypatch.setattr(camera_spec, "to_camera_spec_record", lambda value: value)

    result = await camera_spec.replace_camera_spec_image(
        CAMERA_SPEC_ID,
        upload_image(),
        current_user=SimpleNamespace(),
    )

    assert result.image_version == 3
    assert result.image_storage_key == f"custom/{CAMERA_SPEC_ID}.webp"
    assert service.custom_path(str(CAMERA_SPEC_ID)).is_file()


async def test_remove_image_increments_version_and_clears_custom_metadata(
    monkeypatch: pytest.MonkeyPatch,
    service: CameraSpecImageService,
) -> None:
    service.store(str(CAMERA_SPEC_ID), upload_image().file.read())
    record = FakeCameraRecord(
        camera_type=CameraType.DOME,
        image_storage_key=service.storage_key(str(CAMERA_SPEC_ID)),
        image_version=3,
    )
    monkeypatch.setattr(camera_spec.CameraSpecification, "get", AsyncMock(return_value=record))
    monkeypatch.setattr(camera_spec, "camera_spec_image_service", service)
    monkeypatch.setattr(camera_spec, "to_camera_spec_record", lambda value: value)

    result = await camera_spec.remove_camera_spec_image(
        CAMERA_SPEC_ID,
        current_user=SimpleNamespace(),
    )

    assert result.image_version == 4
    assert result.image_storage_key is None
    assert not service.custom_path(str(CAMERA_SPEC_ID)).exists()
