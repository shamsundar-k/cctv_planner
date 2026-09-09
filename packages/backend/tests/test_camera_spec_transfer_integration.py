from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any
from zipfile import ZipFile

from beanie import PydanticObjectId
from PIL import Image
import pytest

from app.api_models.camera.camera_spec import CameraType
from app.api_models.camera_spec_import import CameraSpecImportIdMapping
from app.services import camera_spec_export_service as export_module
from app.services import camera_spec_import_service as import_module
from app.services.camera_spec_export_service import CameraSpecExportService
from app.services.camera_spec_image_service import CameraSpecImageService
from app.services.camera_spec_import_service import CameraSpecImportService

SOURCE_ID = "66584aef0f5f3e6d8f8a1234"
REPLACEMENT_ID = "66584b9a0f5f3e6d8f8a5678"


def image_service(root: Path) -> CameraSpecImageService:
    return CameraSpecImageService(
        root,
        max_upload_bytes=5 * 1024 * 1024,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )


def source_image() -> bytes:
    output = BytesIO()
    Image.new("RGB", (120, 120), "royalblue").save(output, "WEBP")
    return output.getvalue()


def camera_data(**overrides: Any) -> dict[str, Any]:
    data: dict[str, Any] = {
        "name": "Dome 2MP",
        "manufacturer": "Hikvision",
        "model": "DS-2CD1123G0-I",
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
    }
    data.update(overrides)
    return data


def in_memory_camera_specification() -> type:
    records: dict[str, Any] = {}

    class InMemoryCameraSpecification:
        database = records

        @classmethod
        async def get(cls, camera_spec_id: PydanticObjectId) -> Any | None:
            return cls.database.get(str(camera_spec_id))

        @classmethod
        async def find_one(cls, query: dict[str, str]) -> Any | None:
            return next(
                (
                    record
                    for record in cls.database.values()
                    if record.manufacturer == query["manufacturer"]
                    and record.model == query["model"]
                ),
                None,
            )

        def __init__(self, *, id: PydanticObjectId, **data: Any) -> None:
            self.id = id
            for key, value in data.items():
                setattr(self, key, value)
            self.image_storage_key = None
            self.image_version = 0
            self.image_updated_at = None
            self.created_at = datetime.now(timezone.utc)
            self.updated_at = self.created_at

        async def insert(self) -> None:
            type(self).database[str(self.id)] = self

        async def set(self, updates: dict[str, Any]) -> None:
            for key, value in updates.items():
                setattr(self, key, value)

        async def delete(self) -> None:
            type(self).database.pop(str(self.id), None)

    return InMemoryCameraSpecification


def assert_same_visible_image(source: Path, imported: Path) -> None:
    with Image.open(source) as source_image_file, Image.open(imported) as imported_image_file:
        assert imported_image_file.format == "WEBP"
        assert imported_image_file.size == source_image_file.size
        center = (source_image_file.width // 2, source_image_file.height // 2)
        assert imported_image_file.convert("RGB").getpixel(center) == pytest.approx(
            source_image_file.convert("RGB").getpixel(center),
            abs=2,
        )


async def test_export_preview_and_import_across_systems(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    async def run_inline(function: Any, *args: Any) -> Any:
        return function(*args)

    # Keep this multi-operation integration test deterministic under pytest's
    # module-scoped event loop; thread-pool boundaries are covered by service tests.
    monkeypatch.setattr(export_module, "run_in_threadpool", run_inline)
    monkeypatch.setattr(import_module, "run_in_threadpool", run_inline)
    system_a_images = image_service(tmp_path / "system-a")
    system_a_documents = in_memory_camera_specification()
    source = system_a_documents(id=PydanticObjectId(SOURCE_ID), **camera_data())
    source.image_storage_key = system_a_images.store(SOURCE_ID, source_image())
    source.image_version = 1
    await source.insert()
    monkeypatch.setattr(export_module, "CameraSpecification", system_a_documents)

    exported = await CameraSpecExportService(system_a_images).export(PydanticObjectId(SOURCE_ID))
    with ZipFile(BytesIO(exported.content)) as archive:
        assert archive.namelist() == ["manifest.json", "model.json", "image.webp"]

    system_b_images = image_service(tmp_path / "system-b")
    system_b_documents = in_memory_camera_specification()
    monkeypatch.setattr(import_module, "CameraSpecification", system_b_documents)
    importer = CameraSpecImportService(system_b_images)

    preview = await importer.preview(exported.content)
    assert preview.source_id_available is True
    assert preview.suggested_target_id == SOURCE_ID

    imported = await importer.execute(
        exported.content,
        CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=SOURCE_ID),
    )
    assert imported.camera.id == SOURCE_ID
    assert imported.camera.model_dump(exclude={"id", "image_storage_key", "image_version", "image_updated_at", "created_at", "updated_at"}) == {
        **camera_data(),
        "camera_type": "dome",
    }
    assert_same_visible_image(
        system_a_images.custom_path(SOURCE_ID),
        system_b_images.custom_path(SOURCE_ID),
    )

    conflict_images = image_service(tmp_path / "system-with-id-conflict")
    conflict_documents = in_memory_camera_specification()
    occupied = conflict_documents(
        id=PydanticObjectId(SOURCE_ID),
        **camera_data(name="Different camera", manufacturer="Axis", model="P3265-LVE"),
    )
    await occupied.insert()
    monkeypatch.setattr(import_module, "CameraSpecification", conflict_documents)
    conflict_importer = CameraSpecImportService(conflict_images)

    conflict_preview = await conflict_importer.preview(exported.content)
    assert conflict_preview.source_id_available is False
    assert conflict_preview.requires_new_id is True
    assert conflict_preview.suggested_target_id is None

    replaced = await conflict_importer.execute(
        exported.content,
        CameraSpecImportIdMapping(source_id=SOURCE_ID, target_id=REPLACEMENT_ID),
    )
    assert replaced.mapping.source_id == SOURCE_ID
    assert replaced.mapping.target_id == REPLACEMENT_ID
    assert replaced.camera.id == REPLACEMENT_ID
    assert SOURCE_ID in conflict_documents.database
    assert REPLACEMENT_ID in conflict_documents.database
    assert_same_visible_image(
        system_a_images.custom_path(SOURCE_ID),
        conflict_images.custom_path(REPLACEMENT_ID),
    )
