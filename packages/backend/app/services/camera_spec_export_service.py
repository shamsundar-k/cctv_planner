from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import logging
import re
import unicodedata
from zipfile import ZIP_DEFLATED, ZipFile

from beanie import PydanticObjectId
from starlette.concurrency import run_in_threadpool

from app.api_models.camera_spec_export import (
    CameraSpecExportManifest,
    CameraSpecExportModel,
)
from app.db_schemas.camera_specification import CameraSpecification
from app.services.camera_spec_image_service import (
    CameraSpecImageService,
    camera_spec_image_service,
)

logger = logging.getLogger(__name__)


class CameraSpecExportNotFoundError(LookupError):
    pass


class CameraSpecExportImageError(RuntimeError):
    pass


@dataclass(frozen=True)
class CameraSpecExportArchive:
    content: bytes
    filename: str


class CameraSpecExportService:
    def __init__(self, image_service: CameraSpecImageService) -> None:
        self.image_service = image_service

    async def export(self, camera_spec_id: PydanticObjectId) -> CameraSpecExportArchive:
        camera_spec = await CameraSpecification.get(camera_spec_id)
        if camera_spec is None:
            raise CameraSpecExportNotFoundError

        return await run_in_threadpool(self._build_archive, camera_spec)

    def _build_archive(self, camera_spec: CameraSpecification) -> CameraSpecExportArchive:
        camera_spec_id = str(camera_spec.id)
        custom_path = self.image_service.custom_path(camera_spec_id)
        if camera_spec.image_storage_key and custom_path.is_file():
            image_path = custom_path
            image_source = "custom"
        else:
            if camera_spec.image_storage_key:
                logger.warning(
                    "Camera specification %s references a missing custom image during export",
                    camera_spec_id,
                )
            image_path = self.image_service.default_path(camera_spec.camera_type)
            image_source = "default"

        try:
            image_content = image_path.read_bytes()
        except OSError as exc:
            logger.exception("Failed to read camera image for export: %s", image_path)
            raise CameraSpecExportImageError("Camera image is unavailable") from exc

        model = CameraSpecExportModel(
            name=camera_spec.name,
            manufacturer=camera_spec.manufacturer,
            model=camera_spec.model,
            camera_type=camera_spec.camera_type,
            lens_spec=camera_spec.lens_spec,
            sensor_spec=camera_spec.sensor_spec,
            ir_range=camera_spec.ir_range,
        )
        manifest = CameraSpecExportManifest(
            format="cctv-planner-camera-model",
            schema_version=1,
            source_id=camera_spec_id,
            model_file="model.json",
            image_file="image.webp",
            image_source=image_source,
            image_sha256=sha256(image_content).hexdigest(),
        )

        output = BytesIO()
        with ZipFile(output, mode="w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("manifest.json", manifest.model_dump_json(indent=2) + "\n")
            archive.writestr("model.json", model.model_dump_json(indent=2) + "\n")
            archive.writestr("image.webp", image_content)

        logger.info(
            "Exported camera specification %s using %s image",
            camera_spec_id,
            image_source,
        )
        return CameraSpecExportArchive(
            content=output.getvalue(),
            filename=self._download_filename(camera_spec.manufacturer, camera_spec.model),
        )

    @staticmethod
    def _download_filename(manufacturer: str, model: str) -> str:
        value = unicodedata.normalize("NFKD", f"{manufacturer}-{model}")
        ascii_value = value.encode("ascii", "ignore").decode("ascii").lower()
        slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
        slug = slug[:100].rstrip("-")
        return f"{slug or 'camera-model'}.zip"


camera_spec_export_service = CameraSpecExportService(camera_spec_image_service)
