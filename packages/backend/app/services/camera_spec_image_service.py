from __future__ import annotations

from io import BytesIO
import os
from pathlib import Path
import tempfile

from PIL import Image, ImageOps, UnidentifiedImageError

from app.api_models.camera.camera_spec import CameraType
from app.core.config import settings

ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}
DEFAULT_IMAGE_FILENAMES: dict[CameraType, str] = {
    CameraType.DOME: "dome.webp",
    CameraType.BULLET: "bullet.webp",
    CameraType.PTZ: "ptz.webp",
}


class CameraImageValidationError(ValueError):
    pass


class CameraSpecImageService:
    def __init__(
        self,
        root: Path,
        *,
        max_upload_bytes: int,
        max_source_size: tuple[int, int],
        min_source_size: tuple[int, int],
        output_size: tuple[int, int],
    ) -> None:
        self.root = root.resolve()
        self.max_upload_bytes = max_upload_bytes
        self.max_source_size = max_source_size
        self.min_source_size = min_source_size
        self.output_size = output_size

    def storage_key(self, camera_spec_id: str) -> str:
        self._validate_camera_spec_id(camera_spec_id)
        return f"custom/{camera_spec_id}.webp"

    def custom_path(self, camera_spec_id: str) -> Path:
        return self.root / self.storage_key(camera_spec_id)

    def default_path(self, camera_type: CameraType) -> Path:
        try:
            filename = DEFAULT_IMAGE_FILENAMES[camera_type]
        except KeyError as exc:
            raise RuntimeError(f"No default camera image configured for {camera_type}") from exc
        return self.root / "defaults" / filename

    def normalize(self, content: bytes) -> bytes:
        if len(content) > self.max_upload_bytes:
            raise CameraImageValidationError(
                f"Image exceeds the {self.max_upload_bytes // (1024 * 1024)} MB upload limit"
            )
        if not content:
            raise CameraImageValidationError("Image file is empty")

        try:
            with Image.open(BytesIO(content)) as source:
                if source.format not in ALLOWED_IMAGE_FORMATS:
                    raise CameraImageValidationError("Image must be JPEG, PNG, or WebP")
                if getattr(source, "n_frames", 1) != 1:
                    raise CameraImageValidationError("Animated images are not supported")

                width, height = source.size
                min_width, min_height = self.min_source_size
                max_width, max_height = self.max_source_size
                if width < min_width or height < min_height:
                    raise CameraImageValidationError(
                        f"Image dimensions must be at least {min_width} x {min_height} pixels"
                    )
                if width > max_width or height > max_height:
                    raise CameraImageValidationError(
                        f"Image dimensions cannot exceed {max_width} x {max_height} pixels"
                    )

                source.load()
                normalized = ImageOps.exif_transpose(source)
                has_alpha = normalized.mode in {"RGBA", "LA"} or (
                    normalized.mode == "P" and "transparency" in normalized.info
                )
                normalized = normalized.convert("RGBA" if has_alpha else "RGB")
                normalized.thumbnail(self.output_size, Image.Resampling.LANCZOS)

                output = BytesIO()
                normalized.save(output, format="WEBP", quality=88, method=6)
                return output.getvalue()
        except CameraImageValidationError:
            raise
        except (Image.DecompressionBombError, UnidentifiedImageError, OSError, ValueError) as exc:
            raise CameraImageValidationError("Image content is invalid or corrupt") from exc

    def store(self, camera_spec_id: str, content: bytes) -> str:
        normalized = self.normalize(content)
        final_path = self.custom_path(camera_spec_id)
        final_path.parent.mkdir(parents=True, exist_ok=True)

        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=final_path.parent,
                prefix=f".{camera_spec_id}.",
                suffix=".tmp",
                delete=False,
            ) as temporary:
                temporary.write(normalized)
                temporary.flush()
                os.fsync(temporary.fileno())
                temporary_path = Path(temporary.name)

            with Image.open(temporary_path) as check:
                check.verify()
                if check.format != "WEBP":
                    raise OSError("Normalized image is not WebP")

            os.replace(temporary_path, final_path)
            temporary_path = None
            return self.storage_key(camera_spec_id)
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    def remove(self, camera_spec_id: str) -> None:
        self.custom_path(camera_spec_id).unlink(missing_ok=True)

    @staticmethod
    def _validate_camera_spec_id(camera_spec_id: str) -> None:
        if len(camera_spec_id) != 24 or any(
            char not in "0123456789abcdefABCDEF" for char in camera_spec_id
        ):
            raise ValueError("Invalid camera specification ID")


camera_spec_image_service = CameraSpecImageService(
    settings.CAMERA_IMAGE_ROOT,
    max_upload_bytes=settings.CAMERA_IMAGE_MAX_UPLOAD_BYTES,
    max_source_size=(
        settings.CAMERA_IMAGE_MAX_SOURCE_WIDTH,
        settings.CAMERA_IMAGE_MAX_SOURCE_HEIGHT,
    ),
    min_source_size=(
        settings.CAMERA_IMAGE_MIN_SOURCE_WIDTH,
        settings.CAMERA_IMAGE_MIN_SOURCE_HEIGHT,
    ),
    output_size=(
        settings.CAMERA_IMAGE_OUTPUT_WIDTH,
        settings.CAMERA_IMAGE_OUTPUT_HEIGHT,
    ),
)
