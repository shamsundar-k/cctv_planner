from __future__ import annotations

import asyncio
from base64 import b64encode
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
import json
from json import JSONDecodeError
import logging
from pathlib import PurePosixPath
import stat
from zipfile import BadZipFile, ZipFile, ZipInfo, is_zipfile

from beanie import PydanticObjectId
from PIL import Image
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

from app.api_models.camera_spec_export import (
    CameraSpecExportManifest,
    CameraSpecExportModel,
)
from app.api_models.camera_spec_import import (
    CameraSpecImportImagePreview,
    CameraSpecImportIdMapping,
    CameraSpecImportPreviewResponse,
    CameraSpecImportResponse,
    CameraSpecImportValidation,
)
from app.db_schemas.camera_specification import CameraSpecification
from app.core.config import settings
from app.mappers.camera_spec_mapper import to_camera_spec_record
from app.services.camera_spec_image_service import (
    CameraImageValidationError,
    CameraSpecImageService,
    camera_spec_image_service,
)

EXPECTED_ARCHIVE_FILES = {"manifest.json", "model.json", "image.webp"}
logger = logging.getLogger(__name__)


class CameraSpecImportValidationError(ValueError):
    def __init__(self, errors: list[str]) -> None:
        super().__init__(errors[0] if errors else "Camera model package is invalid")
        self.errors = errors


class CameraSpecImportConflictError(RuntimeError):
    pass


class CameraSpecImportStorageError(RuntimeError):
    pass


@dataclass(frozen=True)
class ValidatedCameraSpecImport:
    manifest: CameraSpecExportManifest
    model: CameraSpecExportModel
    image_content: bytes


class CameraSpecImportService:
    def __init__(
        self,
        image_service: CameraSpecImageService,
        *,
        max_archive_bytes: int = settings.CAMERA_MODEL_ARCHIVE_MAX_UPLOAD_BYTES,
        max_decompressed_bytes: int = settings.CAMERA_MODEL_ARCHIVE_MAX_DECOMPRESSED_BYTES,
        max_json_bytes: int = settings.CAMERA_MODEL_ARCHIVE_MAX_JSON_BYTES,
        max_json_depth: int = settings.CAMERA_MODEL_ARCHIVE_MAX_JSON_DEPTH,
        validation_timeout_seconds: float = (
            settings.CAMERA_MODEL_ARCHIVE_VALIDATION_TIMEOUT_SECONDS
        ),
    ) -> None:
        self.image_service = image_service
        self.max_archive_bytes = max_archive_bytes
        self.max_decompressed_bytes = max_decompressed_bytes
        self.max_json_bytes = max_json_bytes
        self.max_json_depth = max_json_depth
        self.validation_timeout_seconds = validation_timeout_seconds

    async def preview(self, archive_content: bytes) -> CameraSpecImportPreviewResponse:
        package = await self._validate_with_timeout(archive_content)
        source_id = package.manifest.source_id
        warnings: list[str] = []

        if source_id is None:
            source_id_available = None
            suggested_target_id = None
            requires_new_id = True
            warnings.append("Package has no source ID; generate a new target ID before import")
        else:
            source_id_available = (
                await CameraSpecification.get(PydanticObjectId(source_id)) is None
            )
            suggested_target_id = source_id if source_id_available else None
            requires_new_id = not source_id_available
            if requires_new_id:
                warnings.append(
                    "Source ID is already in use; generate a new target ID before import"
                )

        response = CameraSpecImportPreviewResponse(
            model=package.model,
            image=CameraSpecImportImagePreview(
                data_base64=b64encode(package.image_content).decode("ascii"),
                sha256=package.manifest.image_sha256,
                source=package.manifest.image_source,
            ),
            source_id=source_id,
            source_id_available=source_id_available,
            suggested_target_id=suggested_target_id,
            requires_new_id=requires_new_id,
            validation=CameraSpecImportValidation(
                valid=True,
                errors=[],
                warnings=warnings,
            ),
        )
        logger.info("Validated camera specification import preview for source %s", source_id)
        return response

    async def execute(
        self,
        archive_content: bytes,
        mapping: CameraSpecImportIdMapping,
    ) -> CameraSpecImportResponse:
        package = await self._validate_with_timeout(archive_content)
        if mapping.source_id != package.manifest.source_id:
            raise CameraSpecImportValidationError(
                ["ID mapping source_id does not match manifest.json"]
            )

        existing_model = await CameraSpecification.find_one(
            {
                "manufacturer": package.model.manufacturer,
                "model": package.model.model,
            }
        )
        if existing_model is not None:
            raise CameraSpecImportConflictError(
                "Camera specification import conflicts with an existing record"
            )

        target_id = PydanticObjectId(mapping.target_id)
        camera_spec = CameraSpecification(
            id=target_id,
            **package.model.model_dump(),
        )

        if await CameraSpecification.get(target_id) is not None:
            raise CameraSpecImportConflictError(
                "Camera specification import conflicts with an existing record"
            )

        try:
            await camera_spec.insert()
        except DuplicateKeyError as exc:
            raise CameraSpecImportConflictError(
                "Camera specification import conflicts with an existing record"
            ) from exc

        try:
            storage_key = await run_in_threadpool(
                self.image_service.store,
                str(target_id),
                package.image_content,
            )
            now = datetime.now(timezone.utc)
            await camera_spec.set(
                {
                    "image_storage_key": storage_key,
                    "image_version": camera_spec.image_version + 1,
                    "image_updated_at": now,
                    "updated_at": now,
                }
            )
        except Exception as exc:
            await self._rollback(camera_spec, target_id)
            raise CameraSpecImportStorageError(
                "Camera specification image could not be stored"
            ) from exc

        response = CameraSpecImportResponse(
            camera=to_camera_spec_record(camera_spec),
            mapping=CameraSpecImportIdMapping(
                source_id=package.manifest.source_id,
                target_id=str(target_id),
            ),
        )
        logger.info(
            "Imported camera specification from source %s to target %s",
            package.manifest.source_id,
            target_id,
        )
        return response

    async def _validate_with_timeout(
        self,
        archive_content: bytes,
    ) -> ValidatedCameraSpecImport:
        try:
            return await asyncio.wait_for(
                run_in_threadpool(self._validate_archive, archive_content),
                timeout=self.validation_timeout_seconds,
            )
        except TimeoutError as exc:
            raise CameraSpecImportValidationError(
                ["Camera model package validation timed out"]
            ) from exc

    async def _rollback(
        self,
        camera_spec: CameraSpecification,
        target_id: PydanticObjectId,
    ) -> None:
        try:
            await run_in_threadpool(self.image_service.remove, str(target_id))
        except Exception:
            logger.exception("Failed to remove image while rolling back import %s", target_id)
        try:
            await camera_spec.delete()
        except Exception:
            logger.exception("Failed to remove camera specification while rolling back import %s", target_id)

    def _validate_archive(self, archive_content: bytes) -> ValidatedCameraSpecImport:
        if not archive_content:
            raise CameraSpecImportValidationError(["ZIP archive is empty"])
        if len(archive_content) > self.max_archive_bytes:
            raise CameraSpecImportValidationError(
                [f"ZIP archive exceeds the {self.max_archive_bytes} byte upload limit"]
            )

        try:
            with ZipFile(BytesIO(archive_content)) as archive:
                entries = archive.infolist()
                names = [entry.filename for entry in entries]
                if len(names) != len(set(names)):
                    raise CameraSpecImportValidationError(
                        ["ZIP archive contains duplicate filenames"]
                    )
                if len(entries) > len(EXPECTED_ARCHIVE_FILES):
                    raise CameraSpecImportValidationError(
                        ["ZIP archive contains too many files"]
                    )
                for entry in entries:
                    self._validate_archive_entry(entry)
                if set(names) != EXPECTED_ARCHIVE_FILES:
                    raise CameraSpecImportValidationError(
                        ["ZIP archive must contain only manifest.json, model.json, and image.webp"]
                    )
                decompressed_size = sum(entry.file_size for entry in entries)
                if decompressed_size > self.max_decompressed_bytes:
                    raise CameraSpecImportValidationError(
                        [
                            "ZIP archive exceeds the "
                            f"{self.max_decompressed_bytes} byte decompressed limit"
                        ]
                    )
                if archive.testzip() is not None:
                    raise CameraSpecImportValidationError(["ZIP archive contains corrupt data"])

                manifest_content = archive.read("manifest.json")
                model_content = archive.read("model.json")
                image_content = archive.read("image.webp")
        except CameraSpecImportValidationError:
            raise
        except (BadZipFile, OSError, RuntimeError) as exc:
            raise CameraSpecImportValidationError(["Uploaded file is not a valid ZIP archive"]) from exc

        if len(manifest_content) + len(model_content) + len(image_content) > self.max_decompressed_bytes:
            raise CameraSpecImportValidationError(
                [f"ZIP archive exceeds the {self.max_decompressed_bytes} byte decompressed limit"]
            )
        if is_zipfile(BytesIO(image_content)):
            raise CameraSpecImportValidationError(["Nested archives are not supported"])

        manifest_data = self._decode_json(manifest_content, "manifest.json")
        if (
            "schema_version" in manifest_data
            and manifest_data["schema_version"] != 1
        ):
            raise CameraSpecImportValidationError(["Unsupported camera model schema version"])

        try:
            manifest = CameraSpecExportManifest.model_validate_json(
                manifest_content,
                strict=True,
            )
        except ValidationError as exc:
            raise CameraSpecImportValidationError(
                [self._pydantic_error("manifest.json", exc)]
            ) from exc

        model_data = self._decode_json(model_content, "model.json")
        try:
            model = CameraSpecExportModel.model_validate_json(
                model_content,
                strict=True,
            )
        except ValidationError as exc:
            raise CameraSpecImportValidationError(
                [self._pydantic_error("model.json", exc)]
            ) from exc

        actual_checksum = sha256(image_content).hexdigest()
        if actual_checksum != manifest.image_sha256:
            raise CameraSpecImportValidationError(
                ["image.webp checksum does not match manifest.json"]
            )

        try:
            self.image_service.normalize(image_content)
        except CameraImageValidationError as exc:
            raise CameraSpecImportValidationError([f"image.webp is invalid: {exc}"]) from exc
        with Image.open(BytesIO(image_content)) as image:
            if image.format != "WEBP":
                raise CameraSpecImportValidationError(
                    ["image.webp content must use the WebP image format"]
                )

        return ValidatedCameraSpecImport(
            manifest=manifest,
            model=model,
            image_content=image_content,
        )

    def _decode_json(self, content: bytes, filename: str) -> dict[str, object]:
        if len(content) > self.max_json_bytes:
            raise CameraSpecImportValidationError(
                [f"{filename} exceeds the {self.max_json_bytes} byte JSON limit"]
            )

        def unique_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
            value: dict[str, object] = {}
            for key, item in pairs:
                if key in value:
                    raise ValueError(f"duplicate key {key}")
                value[key] = item
            return value

        def reject_constant(value: str) -> None:
            raise ValueError(f"invalid number {value}")

        try:
            value = json.loads(
                content.decode("utf-8"),
                object_pairs_hook=unique_object,
                parse_constant=reject_constant,
            )
        except (UnicodeDecodeError, JSONDecodeError, RecursionError, ValueError) as exc:
            raise CameraSpecImportValidationError([f"{filename} is not valid UTF-8 JSON"]) from exc
        if not isinstance(value, dict):
            raise CameraSpecImportValidationError([f"{filename} must contain a JSON object"])
        self._validate_json_depth(value, filename)
        return value

    def _validate_json_depth(self, value: object, filename: str) -> None:
        pending: list[tuple[object, int]] = [(value, 1)]
        while pending:
            current, depth = pending.pop()
            if depth > self.max_json_depth:
                raise CameraSpecImportValidationError(
                    [f"{filename} exceeds the maximum JSON depth of {self.max_json_depth}"]
                )
            if isinstance(current, dict):
                pending.extend((item, depth + 1) for item in current.values())
            elif isinstance(current, list):
                pending.extend((item, depth + 1) for item in current)

    @staticmethod
    def _validate_archive_entry(entry: ZipInfo) -> None:
        name = entry.filename
        path = PurePosixPath(name)
        if (
            not name
            or "\\" in name
            or path.is_absolute()
            or len(path.parts) != 1
            or any(part in {"", ".", ".."} for part in path.parts)
        ):
            raise CameraSpecImportValidationError(
                ["ZIP archive contains an unsafe file path"]
            )
        if entry.flag_bits & 0x1:
            raise CameraSpecImportValidationError(
                ["Encrypted ZIP entries are not supported"]
            )
        unix_mode = entry.external_attr >> 16
        file_type = stat.S_IFMT(unix_mode)
        if entry.is_dir() or file_type not in {0, stat.S_IFREG}:
            raise CameraSpecImportValidationError(
                ["ZIP archive contains a symlink or special file"]
            )

    @staticmethod
    def _pydantic_error(filename: str, error: ValidationError) -> str:
        first_error = error.errors()[0]
        location = ".".join(str(item) for item in first_error["loc"])
        suffix = f" at {location}" if location else ""
        return f"{filename} is invalid{suffix}: {first_error['msg']}"


camera_spec_import_service = CameraSpecImportService(camera_spec_image_service)
