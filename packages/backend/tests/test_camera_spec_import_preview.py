from base64 import b64decode
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import stat
from types import SimpleNamespace
from unittest.mock import AsyncMock
import time
import warnings
from zipfile import ZipFile, ZipInfo

from beanie import PydanticObjectId
from fastapi import HTTPException, UploadFile
from PIL import Image
import pytest
from pymongo.errors import DuplicateKeyError

from app.api_models.camera_spec_import import CameraSpecImportIdMapping
from app.core.deps import require_admin
from app.routers import camera_spec
from app.services import camera_spec_import_service as import_module
from app.services.camera_spec_image_service import CameraSpecImageService
from app.services.camera_spec_import_service import (
    CameraSpecImportConflictError,
    CameraSpecImportService,
    CameraSpecImportStorageError,
    CameraSpecImportValidationError,
)

SOURCE_ID = "66584aef0f5f3e6d8f8a1234"
TARGET_ID = "66584b9a0f5f3e6d8f8a5678"


@pytest.fixture
def image_service(tmp_path: Path) -> CameraSpecImageService:
    return CameraSpecImageService(
        tmp_path,
        max_upload_bytes=5 * 1024 * 1024,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )


def webp_image() -> bytes:
    content = BytesIO()
    Image.new("RGB", (100, 100), "blue").save(content, "WEBP")
    return content.getvalue()


def png_image() -> bytes:
    content = BytesIO()
    Image.new("RGB", (100, 100), "blue").save(content, "PNG")
    return content.getvalue()


def valid_model() -> dict[str, object]:
    return {
        "name": "Dome 2MP",
        "manufacturer": "Hikvision",
        "model": "DS-2CD1123G0-I",
        "camera_type": "dome",
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
    }


def valid_manifest(image_content: bytes) -> dict[str, object]:
    return {
        "format": "cctv-planner-camera-model",
        "schema_version": 1,
        "source_id": SOURCE_ID,
        "model_file": "model.json",
        "image_file": "image.webp",
        "image_source": "custom",
        "image_sha256": sha256(image_content).hexdigest(),
    }


def build_archive(
    *,
    manifest: dict[str, object] | None = None,
    model: dict[str, object] | None = None,
    image_content: bytes | None = None,
    extra_entries: dict[str, bytes] | None = None,
) -> bytes:
    image = image_content if image_content is not None else webp_image()
    manifest_data = manifest if manifest is not None else valid_manifest(image)
    model_data = model if model is not None else valid_model()
    output = BytesIO()
    with ZipFile(output, "w") as archive:
        archive.writestr("manifest.json", json.dumps(manifest_data))
        archive.writestr("model.json", json.dumps(model_data))
        archive.writestr("image.webp", image)
        for name, content in (extra_entries or {}).items():
            archive.writestr(name, content)
    return output.getvalue()


async def test_preview_returns_validated_model_image_and_available_source_id(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    monkeypatch.setattr(
        import_module.CameraSpecification,
        "get",
        AsyncMock(return_value=None),
    )

    preview = await CameraSpecImportService(image_service).preview(
        build_archive(image_content=image)
    )

    assert preview.validation.valid is True
    assert preview.validation.errors == []
    assert preview.validation.warnings == []
    assert preview.model.model == "DS-2CD1123G0-I"
    assert b64decode(preview.image.data_base64) == image
    assert preview.image.content_type == "image/webp"
    assert preview.image.sha256 == sha256(image).hexdigest()
    assert preview.source_id == SOURCE_ID
    assert preview.source_id_available is True
    assert preview.suggested_target_id == SOURCE_ID
    assert preview.requires_new_id is False


async def test_preview_reports_source_id_conflict_without_generating_replacement(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    monkeypatch.setattr(
        import_module.CameraSpecification,
        "get",
        AsyncMock(return_value=SimpleNamespace()),
    )

    preview = await CameraSpecImportService(image_service).preview(build_archive())

    assert preview.source_id_available is False
    assert preview.suggested_target_id is None
    assert preview.requires_new_id is True
    assert preview.validation.warnings == [
        "Source ID is already in use; generate a new target ID before import"
    ]


async def test_preview_accepts_missing_optional_source_id(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    manifest = valid_manifest(image)
    manifest.pop("source_id")
    get = AsyncMock()
    monkeypatch.setattr(import_module.CameraSpecification, "get", get)

    preview = await CameraSpecImportService(image_service).preview(
        build_archive(manifest=manifest, image_content=image)
    )

    get.assert_not_awaited()
    assert preview.source_id is None
    assert preview.source_id_available is None
    assert preview.suggested_target_id is None
    assert preview.requires_new_id is True


@pytest.mark.parametrize(
    ("archive_content", "expected_error"),
    [
        (b"not a zip", "Uploaded file is not a valid ZIP archive"),
        (b"", "ZIP archive is empty"),
    ],
)
async def test_preview_rejects_invalid_zip_data(
    archive_content: bytes,
    expected_error: str,
    image_service: CameraSpecImageService,
) -> None:
    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(archive_content)

    assert error.value.errors == [expected_error]


async def test_preview_rejects_unexpected_archive_entries(
    image_service: CameraSpecImageService,
) -> None:
    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(
            build_archive(extra_entries={"unexpected.txt": b"no"})
        )

    assert error.value.errors == ["ZIP archive contains too many files"]


async def test_preview_rejects_duplicate_archive_entries(
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    output = BytesIO()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        with ZipFile(output, "w") as archive:
            archive.writestr("manifest.json", json.dumps(valid_manifest(image)))
            archive.writestr("manifest.json", json.dumps(valid_manifest(image)))
            archive.writestr("model.json", json.dumps(valid_model()))
            archive.writestr("image.webp", image)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(output.getvalue())

    assert error.value.errors == ["ZIP archive contains duplicate filenames"]


async def test_preview_rejects_unsupported_schema_version(
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    manifest = valid_manifest(image)
    manifest["schema_version"] = 2

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(
            build_archive(manifest=manifest, image_content=image)
        )

    assert error.value.errors == ["Unsupported camera model schema version"]


async def test_preview_rejects_invalid_model_fields(
    image_service: CameraSpecImageService,
) -> None:
    model = valid_model()
    model["camera_type"] = "hidden-spy-camera"

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive(model=model))

    assert error.value.errors[0].startswith("model.json is invalid at camera_type")


async def test_preview_rejects_image_checksum_mismatch(
    image_service: CameraSpecImageService,
) -> None:
    manifest = valid_manifest(webp_image())
    manifest["image_sha256"] = "0" * 64

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive(manifest=manifest))

    assert error.value.errors == ["image.webp checksum does not match manifest.json"]


async def test_preview_rejects_corrupt_image_content(
    image_service: CameraSpecImageService,
) -> None:
    image = b"not an image"
    manifest = valid_manifest(image)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(
            build_archive(manifest=manifest, image_content=image)
        )

    assert error.value.errors[0].startswith("image.webp is invalid")


async def test_preview_rejects_non_webp_image_content(
    image_service: CameraSpecImageService,
) -> None:
    image = png_image()
    manifest = valid_manifest(image)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(
            build_archive(manifest=manifest, image_content=image)
        )

    assert error.value.errors == ["image.webp content must use the WebP image format"]


async def test_preview_route_returns_structured_validation_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        camera_spec.camera_spec_import_service,
        "preview",
        AsyncMock(side_effect=CameraSpecImportValidationError(["bad package"])),
    )
    upload = UploadFile(file=BytesIO(b"bad"), filename="camera.zip")

    with pytest.raises(HTTPException) as error:
        await camera_spec.preview_camera_spec_import(
            upload,
            current_user=SimpleNamespace(),
        )

    assert error.value.status_code == 422
    assert error.value.detail == {
        "valid": False,
        "errors": ["bad package"],
        "warnings": [],
    }


def fake_camera_specification(
    *,
    existing_id: object | None = None,
    existing_model: object | None = None,
    insert_error: Exception | None = None,
    set_error: Exception | None = None,
) -> type:
    class FakeCameraSpecification:
        created: "FakeCameraSpecification | None" = None

        @classmethod
        async def get(cls, camera_spec_id: PydanticObjectId) -> object | None:
            cls.checked_id = camera_spec_id
            return existing_id

        @classmethod
        async def find_one(cls, query: dict[str, str]) -> object | None:
            cls.uniqueness_query = query
            return existing_model

        def __init__(self, *, id: PydanticObjectId, **data: object) -> None:
            self.id = id
            for key, value in data.items():
                setattr(self, key, value)
            self.image_storage_key = None
            self.image_version = 0
            self.image_updated_at = None
            self.created_at = import_module.datetime.now(import_module.timezone.utc)
            self.updated_at = self.created_at
            self.inserted = False
            self.deleted = False
            type(self).created = self

        async def insert(self) -> None:
            if insert_error is not None:
                raise insert_error
            self.inserted = True

        async def set(self, updates: dict[str, object]) -> None:
            if set_error is not None:
                raise set_error
            for key, value in updates.items():
                setattr(self, key, value)

        async def delete(self) -> None:
            self.deleted = True

    return FakeCameraSpecification


async def test_import_execution_creates_model_and_stores_normalized_image(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification()
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    result = await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    created = fake_document.created
    assert created is not None
    assert created.inserted is True
    assert created.deleted is False
    assert created.id == PydanticObjectId(TARGET_ID)
    assert created.image_storage_key == f"custom/{TARGET_ID}.webp"
    assert created.image_version == 1
    assert image_service.custom_path(TARGET_ID).is_file()
    assert result.camera.id == TARGET_ID
    assert result.mapping.source_id == SOURCE_ID
    assert result.mapping.target_id == TARGET_ID
    assert fake_document.uniqueness_query == {
        "manufacturer": "Hikvision",
        "model": "DS-2CD1123G0-I",
    }
    assert fake_document.checked_id == PydanticObjectId(TARGET_ID)


async def test_import_execution_rejects_mapping_source_mismatch(
    image_service: CameraSpecImageService,
) -> None:
    mapping = CameraSpecImportIdMapping(source_id=TARGET_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    assert error.value.errors == ["ID mapping source_id does not match manifest.json"]


async def test_import_execution_rechecks_target_id_before_insert(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification(existing_id=SimpleNamespace())
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportConflictError, match="conflicts with an existing record"):
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    assert fake_document.created is not None
    assert fake_document.created.inserted is False


async def test_import_execution_rejects_duplicate_manufacturer_and_model(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification(existing_model=SimpleNamespace())
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportConflictError, match="conflicts with an existing record"):
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    assert fake_document.created is None


async def test_import_execution_handles_insert_race_conflict(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification(insert_error=DuplicateKeyError("duplicate"))
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportConflictError, match="conflicts with an existing record"):
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)


async def test_import_execution_rolls_back_record_when_image_storage_fails(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification()
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)

    def fail_store(camera_spec_id: str, content: bytes) -> str:
        raise OSError("storage unavailable")

    monkeypatch.setattr(image_service, "store", fail_store)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportStorageError):
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    assert fake_document.created is not None
    assert fake_document.created.deleted is True
    assert not image_service.custom_path(TARGET_ID).exists()


async def test_import_execution_removes_image_and_record_when_metadata_update_fails(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    fake_document = fake_camera_specification(set_error=OSError("database unavailable"))
    monkeypatch.setattr(import_module, "CameraSpecification", fake_document)
    mapping = CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=TARGET_ID)

    with pytest.raises(CameraSpecImportStorageError):
        await CameraSpecImportService(image_service).execute(build_archive(), mapping)

    assert fake_document.created is not None
    assert fake_document.created.deleted is True
    assert not image_service.custom_path(TARGET_ID).exists()


async def test_import_route_rejects_invalid_mapping_and_closes_upload() -> None:
    upload = UploadFile(file=BytesIO(build_archive()), filename="camera.zip")

    with pytest.raises(HTTPException) as error:
        await camera_spec.import_camera_spec(
            upload,
            id_mapping="{}",
            current_user=SimpleNamespace(),
        )

    assert error.value.status_code == 422
    assert upload.file.closed is True


async def test_import_route_maps_conflicts_to_409_and_closes_upload(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        camera_spec.camera_spec_import_service,
        "execute",
        AsyncMock(side_effect=CameraSpecImportConflictError("target conflict")),
    )
    upload = UploadFile(file=BytesIO(build_archive()), filename="camera.zip")

    with pytest.raises(HTTPException) as error:
        await camera_spec.import_camera_spec(
            upload,
            id_mapping=json.dumps({"source_id": SOURCE_ID, "target_id": TARGET_ID}),
            current_user=SimpleNamespace(),
        )

    assert error.value.status_code == 409
    assert error.value.detail == "target conflict"
    assert upload.file.closed is True


def build_archive_with_entries(entries: list[tuple[str | ZipInfo, bytes]]) -> bytes:
    output = BytesIO()
    with ZipFile(output, "w") as archive:
        for name, content in entries:
            archive.writestr(name, content)
    return output.getvalue()


def valid_archive_entries(image: bytes | None = None) -> list[tuple[str, bytes]]:
    image_content = image if image is not None else webp_image()
    return [
        ("manifest.json", json.dumps(valid_manifest(image_content)).encode()),
        ("model.json", json.dumps(valid_model()).encode()),
        ("image.webp", image_content),
    ]


@pytest.mark.parametrize(
    "unsafe_name",
    ["../manifest.json", "/manifest.json", "dir/model.json", "dir\\model.json"],
)
async def test_preview_rejects_unsafe_archive_paths(
    unsafe_name: str,
    image_service: CameraSpecImageService,
) -> None:
    entries = valid_archive_entries()
    entries[0] = (unsafe_name, entries[0][1])

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive_with_entries(entries))

    assert error.value.errors == ["ZIP archive contains an unsafe file path"]


async def test_preview_rejects_symlink_archive_entry(
    image_service: CameraSpecImageService,
) -> None:
    entries: list[tuple[str | ZipInfo, bytes]] = valid_archive_entries()
    symlink = ZipInfo("image.webp")
    symlink.create_system = 3
    symlink.external_attr = (stat.S_IFLNK | 0o777) << 16
    entries[2] = (symlink, b"manifest.json")

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive_with_entries(entries))

    assert error.value.errors == ["ZIP archive contains a symlink or special file"]


async def test_preview_rejects_nested_archive(
    image_service: CameraSpecImageService,
) -> None:
    nested = build_archive_with_entries([("nested.txt", b"nested")])
    manifest = valid_manifest(nested)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(
            build_archive(manifest=manifest, image_content=nested)
        )

    assert error.value.errors == ["Nested archives are not supported"]


async def test_preview_rejects_archive_over_upload_limit(
    image_service: CameraSpecImageService,
) -> None:
    archive = build_archive()
    service = CameraSpecImportService(image_service, max_archive_bytes=len(archive) - 1)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await service.preview(archive)

    assert "upload limit" in error.value.errors[0]


async def test_preview_rejects_archive_over_decompressed_limit(
    image_service: CameraSpecImageService,
) -> None:
    service = CameraSpecImportService(image_service, max_decompressed_bytes=100)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await service.preview(build_archive())

    assert "decompressed limit" in error.value.errors[0]


async def test_preview_rejects_json_over_size_limit(
    image_service: CameraSpecImageService,
) -> None:
    service = CameraSpecImportService(image_service, max_json_bytes=100)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await service.preview(build_archive())

    assert "manifest.json exceeds" in error.value.errors[0]


async def test_preview_rejects_excessive_json_depth(
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    manifest = valid_manifest(image)
    manifest["unexpected"] = {"one": {"two": {"three": True}}}
    service = CameraSpecImportService(image_service, max_json_depth=3)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await service.preview(build_archive(manifest=manifest, image_content=image))

    assert error.value.errors == ["manifest.json exceeds the maximum JSON depth of 3"]


async def test_preview_rejects_duplicate_json_keys(
    image_service: CameraSpecImageService,
) -> None:
    image = webp_image()
    manifest_json = json.dumps(valid_manifest(image))
    duplicate_manifest = manifest_json[:-1] + ', "schema_version": 1}'
    entries = valid_archive_entries(image)
    entries[0] = ("manifest.json", duplicate_manifest.encode())

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive_with_entries(entries))

    assert error.value.errors == ["manifest.json is not valid UTF-8 JSON"]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("name", "x" * 201),
        ("ir_range", 10_001),
        ("ir_range", "30"),
    ],
)
async def test_preview_rejects_unsafe_model_limits_and_coercion(
    field: str,
    value: object,
    image_service: CameraSpecImageService,
) -> None:
    model = valid_model()
    model[field] = value

    with pytest.raises(CameraSpecImportValidationError) as error:
        await CameraSpecImportService(image_service).preview(build_archive(model=model))

    assert error.value.errors[0].startswith(f"model.json is invalid at {field}")


async def test_preview_validation_has_timeout(
    monkeypatch: pytest.MonkeyPatch,
    image_service: CameraSpecImageService,
) -> None:
    service = CameraSpecImportService(image_service, validation_timeout_seconds=0.001)

    def slow_validation(content: bytes) -> object:
        time.sleep(0.05)
        return content

    monkeypatch.setattr(service, "_validate_archive", slow_validation)

    with pytest.raises(CameraSpecImportValidationError) as error:
        await service.preview(build_archive())

    assert error.value.errors == ["Camera model package validation timed out"]


def test_transfer_routes_require_admin() -> None:
    transfer_paths = {
        "/camera-specs/import/preview",
        "/camera-specs/import",
        "/camera-specs/{camera_spec_id}/export",
    }
    transfer_routes = [
        route for route in camera_spec.router.routes if route.path in transfer_paths
    ]

    assert len(transfer_routes) == 3
    for route in transfer_routes:
        assert any(dependency.call is require_admin for dependency in route.dependant.dependencies)
