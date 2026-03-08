"""Unit tests for the DORI-spec camera model.

Tests cover:
- CameraModelCreate schema validation (fixed and varifocal/motorised lenses)
- CameraModel document model_validator (cross-field constraints)
"""

import pytest
from pydantic import ValidationError

from app.models.camera_model import CameraType, LensType, SensorType
from app.schemas.camera_model import CameraModelCreate, CameraModelUpdate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _varifocal_payload(**overrides) -> dict:
    """Minimal valid varifocal camera payload."""
    base = dict(
        name="Varifocal Cam",
        manufacturer="Hikvision",
        model_number="DS-2CD2T47G2-L",
        camera_type=CameraType.bullet,
        lens_type=LensType.motorised,
        focal_length_min=2.8,
        focal_length_max=12.0,
        h_fov_min=28.0,
        h_fov_max=97.0,
        v_fov_min=16.0,
        v_fov_max=54.0,
        resolution_h=2560,
        resolution_v=1440,
    )
    base.update(overrides)
    return base


def _fixed_payload(**overrides) -> dict:
    """Minimal valid fixed lens camera payload."""
    base = dict(
        name="Fixed Cam",
        manufacturer="Axis",
        lens_type=LensType.fixed,
        focal_length_min=4.0,
        focal_length_max=4.0,
        h_fov_min=90.0,
        h_fov_max=90.0,
        v_fov_min=56.0,
        v_fov_max=56.0,
        resolution_h=1920,
        resolution_v=1080,
    )
    base.update(overrides)
    return base



# ---------------------------------------------------------------------------
# CameraModelCreate — varifocal / motorised lens
# ---------------------------------------------------------------------------

class TestCameraModelCreateVarifocal:
    def test_valid_varifocal(self):
        cm = CameraModelCreate(**_varifocal_payload())
        assert cm.lens_type == LensType.motorised
        assert cm.focal_length_min == 2.8
        assert cm.focal_length_max == 12.0
        assert cm.h_fov_max == 97.0
        assert cm.h_fov_min == 28.0

    def test_optional_sensor_fields_default(self):
        cm = CameraModelCreate(**_varifocal_payload())
        assert cm.megapixels is None
        assert cm.wdr is False
        assert cm.ir_cut_filter is True

    def test_full_sensor_fields(self):
        cm = CameraModelCreate(
            **_varifocal_payload(
                megapixels=4.0,
                aspect_ratio="16:9",
                sensor_size='1/2.7"',
                sensor_type=SensorType.starvis,
                min_illumination=0.005,
                wdr=True,
                wdr_db=120.0,
            )
        )
        assert cm.megapixels == 4.0
        assert cm.sensor_type == SensorType.starvis
        assert cm.wdr_db == 120.0

    def test_focal_length_max_less_than_min_raises(self):
        with pytest.raises(ValidationError, match="focal_length_max"):
            CameraModelCreate(**_varifocal_payload(focal_length_min=12.0, focal_length_max=2.8))

    def test_h_fov_max_less_than_min_raises(self):
        with pytest.raises(ValidationError, match="h_fov_max"):
            CameraModelCreate(**_varifocal_payload(h_fov_min=97.0, h_fov_max=28.0))

    def test_v_fov_max_less_than_min_raises(self):
        with pytest.raises(ValidationError, match="v_fov_max"):
            CameraModelCreate(**_varifocal_payload(v_fov_min=54.0, v_fov_max=16.0))

    def test_missing_resolution_h_raises(self):
        payload = _varifocal_payload()
        del payload["resolution_h"]
        with pytest.raises(ValidationError):
            CameraModelCreate(**payload)

    def test_zero_resolution_raises(self):
        with pytest.raises(ValidationError):
            CameraModelCreate(**_varifocal_payload(resolution_h=0))

    def test_negative_focal_length_raises(self):
        with pytest.raises(ValidationError):
            CameraModelCreate(**_varifocal_payload(focal_length_min=-1.0, focal_length_max=-0.5))


# ---------------------------------------------------------------------------
# CameraModelCreate — fixed lens
# ---------------------------------------------------------------------------

class TestCameraModelCreateFixed:
    def test_valid_fixed(self):
        cm = CameraModelCreate(**_fixed_payload())
        assert cm.lens_type == LensType.fixed
        assert cm.focal_length_min == cm.focal_length_max == 4.0
        assert cm.h_fov_min == cm.h_fov_max == 90.0

    def test_fixed_focal_lengths_differ_raises(self):
        with pytest.raises(ValidationError, match="focal_length_min == focal_length_max"):
            CameraModelCreate(**_fixed_payload(focal_length_min=4.0, focal_length_max=8.0))

    def test_fixed_h_fov_differ_raises(self):
        with pytest.raises(ValidationError, match="h_fov_max == h_fov_min"):
            CameraModelCreate(**_fixed_payload(h_fov_min=60.0, h_fov_max=90.0))

    def test_fixed_v_fov_differ_raises(self):
        with pytest.raises(ValidationError, match="v_fov_max == v_fov_min"):
            CameraModelCreate(**_fixed_payload(v_fov_min=40.0, v_fov_max=56.0))

    def test_fixed_camera_type_variety(self):
        cm = CameraModelCreate(**_fixed_payload(camera_type=CameraType.fixed_dome))
        assert cm.camera_type == CameraType.fixed_dome


# ---------------------------------------------------------------------------
# CameraModelUpdate — partial update validation
# ---------------------------------------------------------------------------

class TestCameraModelUpdate:
    def test_empty_update_is_valid(self):
        upd = CameraModelUpdate()
        assert upd.name is None
        assert upd.focal_length_min is None

    def test_partial_lens_update_valid(self):
        upd = CameraModelUpdate(focal_length_min=3.6, focal_length_max=11.0)
        assert upd.focal_length_min == 3.6

    def test_partial_focal_length_order_violation(self):
        with pytest.raises(ValidationError, match="focal_length_max"):
            CameraModelUpdate(focal_length_min=12.0, focal_length_max=3.0)

    def test_partial_h_fov_order_violation(self):
        with pytest.raises(ValidationError, match="h_fov_max"):
            CameraModelUpdate(h_fov_min=90.0, h_fov_max=28.0)

    def test_partial_v_fov_order_violation(self):
        with pytest.raises(ValidationError, match="v_fov_max"):
            CameraModelUpdate(v_fov_min=54.0, v_fov_max=16.0)

    def test_single_field_order_not_checked(self):
        # Providing only one FOV bound is fine at the schema level —
        # the router validates the merged document state.
        upd = CameraModelUpdate(h_fov_max=50.0)
        assert upd.h_fov_max == 50.0

