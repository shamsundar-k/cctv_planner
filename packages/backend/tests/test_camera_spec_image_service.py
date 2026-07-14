from io import BytesIO
from pathlib import Path

from PIL import Image
import pytest

from app.api_models.camera.camera_spec import CameraType
from app.services.camera_spec_image_service import (
    CameraImageValidationError,
    CameraSpecImageService,
)

CAMERA_SPEC_ID = "66584aef0f5f3e6d8f8a1234"


@pytest.fixture
def service(tmp_path: Path) -> CameraSpecImageService:
    return CameraSpecImageService(
        tmp_path,
        max_upload_bytes=5 * 1024 * 1024,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )


def image_bytes(
    image_format: str,
    *,
    size: tuple[int, int] = (900, 450),
    mode: str = "RGB",
) -> bytes:
    color = (25, 100, 150, 160) if mode == "RGBA" else (25, 100, 150)
    image = Image.new(mode, size, color)
    output = BytesIO()
    image.save(output, format=image_format)
    return output.getvalue()


@pytest.mark.parametrize("image_format", ["JPEG", "PNG", "WEBP"])
def test_normalizes_supported_images_to_bounded_webp(
    service: CameraSpecImageService,
    image_format: str,
) -> None:
    result = service.normalize(image_bytes(image_format))

    with Image.open(BytesIO(result)) as normalized:
        assert normalized.format == "WEBP"
        assert normalized.size == (600, 300)


def test_preserves_transparency(service: CameraSpecImageService) -> None:
    result = service.normalize(image_bytes("PNG", mode="RGBA"))

    with Image.open(BytesIO(result)) as normalized:
        assert normalized.mode == "RGBA"


@pytest.mark.parametrize(
    ("content", "message"),
    [
        (b"not an image", "invalid or corrupt"),
        (image_bytes("BMP"), "JPEG, PNG, or WebP"),
        (image_bytes("PNG", size=(32, 80)), "at least 64 x 64"),
        (image_bytes("PNG", size=(2001, 100)), "cannot exceed 2000 x 2000"),
    ],
    ids=["corrupt", "unsupported", "too-small", "too-large"],
)
def test_rejects_invalid_images(
    service: CameraSpecImageService,
    content: bytes,
    message: str,
) -> None:
    with pytest.raises(CameraImageValidationError, match=message):
        service.normalize(content)


def test_rejects_animated_webp(service: CameraSpecImageService) -> None:
    first = Image.new("RGB", (100, 100), "red")
    second = Image.new("RGB", (100, 100), "blue")
    output = BytesIO()
    first.save(output, format="WEBP", save_all=True, append_images=[second], duration=100, loop=0)

    with pytest.raises(CameraImageValidationError, match="Animated images"):
        service.normalize(output.getvalue())


def test_rejects_upload_over_byte_limit(tmp_path: Path) -> None:
    service = CameraSpecImageService(
        tmp_path,
        max_upload_bytes=10,
        max_source_size=(2000, 2000),
        min_source_size=(64, 64),
        output_size=(600, 600),
    )

    with pytest.raises(CameraImageValidationError, match="upload limit"):
        service.normalize(image_bytes("PNG"))


def test_store_uses_specification_id_and_replaces_atomically(
    service: CameraSpecImageService,
) -> None:
    storage_key = service.store(CAMERA_SPEC_ID, image_bytes("JPEG"))
    first_content = service.custom_path(CAMERA_SPEC_ID).read_bytes()

    assert storage_key == f"custom/{CAMERA_SPEC_ID}.webp"
    assert service.custom_path(CAMERA_SPEC_ID).is_file()

    service.store(CAMERA_SPEC_ID, image_bytes("PNG", size=(450, 900)))
    assert service.custom_path(CAMERA_SPEC_ID).read_bytes() != first_content
    assert list(service.custom_path(CAMERA_SPEC_ID).parent.glob("*.tmp")) == []


def test_failed_replacement_keeps_existing_image(service: CameraSpecImageService) -> None:
    service.store(CAMERA_SPEC_ID, image_bytes("JPEG"))
    existing = service.custom_path(CAMERA_SPEC_ID).read_bytes()

    with pytest.raises(CameraImageValidationError):
        service.store(CAMERA_SPEC_ID, b"corrupt")

    assert service.custom_path(CAMERA_SPEC_ID).read_bytes() == existing


def test_remove_restores_absent_custom_state(service: CameraSpecImageService) -> None:
    service.store(CAMERA_SPEC_ID, image_bytes("JPEG"))
    service.remove(CAMERA_SPEC_ID)
    service.remove(CAMERA_SPEC_ID)

    assert not service.custom_path(CAMERA_SPEC_ID).exists()


@pytest.mark.parametrize("unsafe_id", ["../camera", CAMERA_SPEC_ID + "/other", "not-an-object-id"])
def test_rejects_unsafe_specification_ids(
    service: CameraSpecImageService,
    unsafe_id: str,
) -> None:
    with pytest.raises(ValueError, match="Invalid camera specification ID"):
        service.custom_path(unsafe_id)


@pytest.mark.parametrize(
    ("camera_type", "filename"),
    [
        (CameraType.DOME, "dome.webp"),
        (CameraType.BULLET, "bullet.webp"),
        (CameraType.PTZ, "ptz.webp"),
    ],
)
def test_maps_camera_types_to_controlled_defaults(
    service: CameraSpecImageService,
    camera_type: CameraType,
    filename: str,
) -> None:
    assert service.default_path(camera_type) == service.root / "defaults" / filename
