from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock
from zipfile import ZipFile

from beanie import PydanticObjectId
from fastapi import HTTPException
from PIL import Image
import pytest

from app.api_models.camera.camera_spec import CameraType
from app.routers import camera_spec
from app.services import camera_spec_export_service as export_module
from app.services.camera_spec_export_service import (
    CameraSpecExportArchive,
    CameraSpecExportNotFoundError,
    CameraSpecExportService,
)
from app.services.camera_spec_image_service import CameraSpecImageService

CAMERA_SPEC_ID = PydanticObjectId("66584aef0f5f3e6d8f8a1234")


@pytest.fixture
def image_service(tmp_path: Path) -> CameraSpecImageService:
    service = CameraSpecImageService(
        tmp_path,
        max_upload_bytes=5 * 1024 * 1024,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )
    defaults = tmp_path / "defaults"
    defaults.mkdir()
    for camera_type, color in (("dome", "gray"), ("bullet", "black"), ("ptz", "white")):
        Image.new("RGB", (100, 100), color).save(defaults / f"{camera_type}.webp", "WEBP")
    return service


def camera_record(**overrides: object) -> SimpleNamespace:
    values: dict[str, object] = {
        "id": CAMERA_SPEC_ID,
        "name": "Internal display name",
        "manufacturer": "Hikvision / Unsafe",
        "model": "DS-2CD1123G0-I #1",
        "camera_type": CameraType.DOME,
        "lens_spec": {
            "lens_type": "fixed",
            "focal_length": {"min": 2.8, "max": 2.8},
            "h_fov": {"min": 105.0, "max": 105.0},
            "v_fov": {"min": 56.0, "max": 56.0},
        },
        "sensor_spec": {
            "resolution": {"horizontal": 1920, "vertical": 1080},
            "megapixel": 2.0,
            "sensor_size": "1/2.8 inch",
        },
        "ir_range": 30.0,
        "image_storage_key": None,
        "image_version": 9,
        "created_by": "private-user-id",
        "created_at": "destination-specific",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


async def test_export_builds_exact_archive_with_custom_image(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    custom_path = image_service.custom_path(str(CAMERA_SPEC_ID))
    custom_path.parent.mkdir()
    Image.new("RGB", (120, 120), "blue").save(custom_path, "WEBP")
    record = camera_record(image_storage_key=image_service.storage_key(str(CAMERA_SPEC_ID)))
    monkeypatch.setattr(export_module.CameraSpecification, "get", AsyncMock(return_value=record))

    result = await CameraSpecExportService(image_service).export(CAMERA_SPEC_ID)

    with ZipFile(BytesIO(result.content)) as archive:
        assert archive.namelist() == ["manifest.json", "model.json", "image.webp"]
        manifest = json.loads(archive.read("manifest.json"))
        model = json.loads(archive.read("model.json"))
        image_content = archive.read("image.webp")

    assert manifest == {
        "format": "cctv-planner-camera-model",
        "schema_version": 1,
        "source_id": str(CAMERA_SPEC_ID),
        "model_file": "model.json",
        "image_file": "image.webp",
        "image_source": "custom",
        "image_sha256": sha256(image_content).hexdigest(),
    }
    assert set(model) == {
        "name",
        "manufacturer",
        "model",
        "camera_type",
        "lens_spec",
        "sensor_spec",
        "ir_range",
    }
    assert "image_storage_key" not in model
    assert "image_version" not in model
    assert "created_by" not in model
    assert "created_at" not in model
    assert result.filename == "hikvision-unsafe-ds-2cd1123g0-i-1.zip"


async def test_export_includes_camera_type_default_image(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    record = camera_record(camera_type=CameraType.BULLET)
    monkeypatch.setattr(export_module.CameraSpecification, "get", AsyncMock(return_value=record))

    result = await CameraSpecExportService(image_service).export(CAMERA_SPEC_ID)

    with ZipFile(BytesIO(result.content)) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        image_content = archive.read("image.webp")

    assert manifest["image_source"] == "default"
    assert image_content == image_service.default_path(CameraType.BULLET).read_bytes()
    assert manifest["image_sha256"] == sha256(image_content).hexdigest()


async def test_export_missing_model_raises_not_found(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    monkeypatch.setattr(export_module.CameraSpecification, "get", AsyncMock(return_value=None))

    with pytest.raises(CameraSpecExportNotFoundError):
        await CameraSpecExportService(image_service).export(CAMERA_SPEC_ID)


async def test_export_route_returns_download_response(monkeypatch: pytest.MonkeyPatch) -> None:
    archive = CameraSpecExportArchive(content=b"zip-content", filename="safe-camera.zip")
    monkeypatch.setattr(
        camera_spec.camera_spec_export_service,
        "export",
        AsyncMock(return_value=archive),
    )

    response = await camera_spec.export_camera_spec(
        CAMERA_SPEC_ID,
        current_user=SimpleNamespace(),
    )

    assert response.body == b"zip-content"
    assert response.media_type == "application/zip"
    assert response.headers["content-disposition"] == 'attachment; filename="safe-camera.zip"'


async def test_export_route_returns_404_for_missing_model(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        camera_spec.camera_spec_export_service,
        "export",
        AsyncMock(side_effect=CameraSpecExportNotFoundError),
    )

    with pytest.raises(HTTPException) as error:
        await camera_spec.export_camera_spec(
            CAMERA_SPEC_ID,
            current_user=SimpleNamespace(),
        )

    assert error.value.status_code == 404
