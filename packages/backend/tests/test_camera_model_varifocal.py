"""Unit tests for varifocal camera model support.

Tests cover:
- CameraModelCreate schema validation (fixed and varifocal)
- CameraModel document model_validator
- resolve_effective_fov service function
"""

import pytest
from pydantic import ValidationError

from app.models.camera_instance import CameraInstance
from app.models.camera_model import CameraModel, LensType
from app.schemas.camera_model import CameraModelCreate
from app.services.camera_resolution import resolve_effective_fov


# ---------------------------------------------------------------------------
# Helpers — build model/instance without hitting MongoDB
# ---------------------------------------------------------------------------

def _fixed_model(**kwargs) -> CameraModel:
    defaults = dict(
        name="Fixed Cam",
        manufacturer="Acme",
        lens_type=LensType.fixed,
        fov_angle=90.0,
        min_range=0.0,
        max_range=20.0,
        fov_angle_wide=None,
        max_range_wide=None,
        fov_angle_tele=None,
        max_range_tele=None,
        created_by=None,
        created_at=None,
    )
    defaults.update(kwargs)
    return CameraModel.model_construct(**defaults)


def _varifocal_model(**kwargs) -> CameraModel:
    defaults = dict(
        name="Varifocal Cam",
        manufacturer="Acme",
        lens_type=LensType.varifocal,
        fov_angle=None,
        min_range=0.0,
        max_range=None,
        fov_angle_wide=90.0,
        max_range_wide=10.0,
        fov_angle_tele=20.0,
        max_range_tele=50.0,
        created_by=None,
        created_at=None,
    )
    defaults.update(kwargs)
    return CameraModel.model_construct(**defaults)


def _instance(**kwargs) -> CameraInstance:
    defaults = dict(
        project=None,
        camera_model=None,
        label="",
        lat=51.5,
        lng=-0.1,
        bearing=0.0,
        fov_angle_override=None,
        min_range_override=None,
        max_range_override=None,
        colour="#3B82F6",
        visible=True,
        fov_geojson=None,
        created_at=None,
        updated_at=None,
    )
    defaults.update(kwargs)
    return CameraInstance.model_construct(**defaults)


# ---------------------------------------------------------------------------
# CameraModelCreate schema — fixed camera
# ---------------------------------------------------------------------------

class TestCameraModelCreateFixed:
    def test_valid_fixed(self):
        cm = CameraModelCreate(name="Cam", fov_angle=90.0, max_range=20.0)
        assert cm.lens_type == LensType.fixed
        assert cm.fov_angle == 90.0
        assert cm.max_range == 20.0

    def test_fixed_missing_fov_angle(self):
        with pytest.raises(ValidationError, match="fov_angle"):
            CameraModelCreate(name="Cam", max_range=20.0)

    def test_fixed_missing_max_range(self):
        with pytest.raises(ValidationError, match="max_range"):
            CameraModelCreate(name="Cam", fov_angle=90.0)

    def test_fixed_rejects_varifocal_fields(self):
        with pytest.raises(ValidationError, match="varifocal"):
            CameraModelCreate(
                name="Cam",
                fov_angle=90.0,
                max_range=20.0,
                fov_angle_wide=90.0,
                max_range_wide=10.0,
                fov_angle_tele=20.0,
                max_range_tele=50.0,
            )


# ---------------------------------------------------------------------------
# CameraModelCreate schema — varifocal camera
# ---------------------------------------------------------------------------

class TestCameraModelCreateVarifocal:
    def test_valid_varifocal(self):
        cm = CameraModelCreate(
            name="VF Cam",
            lens_type=LensType.varifocal,
            fov_angle_wide=90.0,
            max_range_wide=10.0,
            fov_angle_tele=20.0,
            max_range_tele=50.0,
        )
        assert cm.fov_angle is None
        assert cm.max_range is None
        assert cm.fov_angle_wide == 90.0

    def test_varifocal_incomplete_fields(self):
        with pytest.raises(ValidationError, match="require"):
            CameraModelCreate(
                name="VF Cam",
                lens_type=LensType.varifocal,
                fov_angle_wide=90.0,
                max_range_wide=10.0,
                # missing fov_angle_tele and max_range_tele
            )

    def test_varifocal_rejects_fov_angle(self):
        with pytest.raises(ValidationError, match="must not supply"):
            CameraModelCreate(
                name="VF Cam",
                lens_type=LensType.varifocal,
                fov_angle=45.0,
                fov_angle_wide=90.0,
                max_range_wide=10.0,
                fov_angle_tele=20.0,
                max_range_tele=50.0,
            )

    def test_varifocal_tele_not_less_than_wide_fov(self):
        with pytest.raises(ValidationError, match="fov_angle_tele must be less than"):
            CameraModelCreate(
                name="VF Cam",
                lens_type=LensType.varifocal,
                fov_angle_wide=20.0,
                max_range_wide=10.0,
                fov_angle_tele=90.0,  # wrong: tele wider than wide
                max_range_tele=50.0,
            )

    def test_varifocal_range_wide_not_less_than_tele(self):
        with pytest.raises(ValidationError, match="max_range_wide must be less than"):
            CameraModelCreate(
                name="VF Cam",
                lens_type=LensType.varifocal,
                fov_angle_wide=90.0,
                max_range_wide=50.0,  # wrong: wide range longer than tele
                fov_angle_tele=20.0,
                max_range_tele=10.0,
            )


# ---------------------------------------------------------------------------
# resolve_effective_fov — fixed camera
# ---------------------------------------------------------------------------

class TestResolveFixedCamera:
    def test_no_overrides_uses_model_defaults(self):
        model = _fixed_model(fov_angle=90.0, min_range=0.0, max_range=20.0)
        inst = _instance()
        fov, min_r, max_r = resolve_effective_fov(inst, model)
        assert fov == 90.0
        assert min_r == 0.0
        assert max_r == 20.0

    def test_fov_override(self):
        model = _fixed_model(fov_angle=90.0, max_range=20.0)
        inst = _instance(fov_angle_override=60.0)
        fov, _, _ = resolve_effective_fov(inst, model)
        assert fov == 60.0

    def test_range_override(self):
        model = _fixed_model(fov_angle=90.0, max_range=20.0)
        inst = _instance(max_range_override=30.0)
        _, _, max_r = resolve_effective_fov(inst, model)
        assert max_r == 30.0

    def test_min_range_override(self):
        model = _fixed_model(fov_angle=90.0, max_range=20.0, min_range=0.0)
        inst = _instance(min_range_override=2.0)
        _, min_r, _ = resolve_effective_fov(inst, model)
        assert min_r == 2.0


# ---------------------------------------------------------------------------
# resolve_effective_fov — varifocal camera
# ---------------------------------------------------------------------------

class TestResolveVarifocalCamera:
    def test_no_override_defaults_to_wide_end(self):
        model = _varifocal_model(
            fov_angle_wide=90.0, max_range_wide=10.0,
            fov_angle_tele=20.0, max_range_tele=50.0,
        )
        inst = _instance()
        fov, _, max_r = resolve_effective_fov(inst, model)
        assert fov == 90.0
        assert max_r == 10.0

    def test_fov_override_at_tele_end_interpolates_max_range(self):
        model = _varifocal_model(
            fov_angle_wide=90.0, max_range_wide=10.0,
            fov_angle_tele=20.0, max_range_tele=50.0,
        )
        inst = _instance(fov_angle_override=20.0)  # fully at tele
        fov, _, max_r = resolve_effective_fov(inst, model)
        assert fov == 20.0
        assert max_r == pytest.approx(50.0)

    def test_fov_override_at_wide_end_interpolates_max_range(self):
        model = _varifocal_model(
            fov_angle_wide=90.0, max_range_wide=10.0,
            fov_angle_tele=20.0, max_range_tele=50.0,
        )
        inst = _instance(fov_angle_override=90.0)  # fully at wide
        fov, _, max_r = resolve_effective_fov(inst, model)
        assert fov == 90.0
        assert max_r == pytest.approx(10.0)

    def test_fov_override_at_midpoint_interpolates_range(self):
        model = _varifocal_model(
            fov_angle_wide=90.0, max_range_wide=10.0,
            fov_angle_tele=20.0, max_range_tele=50.0,
        )
        # midpoint FOV = (90+20)/2 = 55 → t=0.5 → range = 10 + 0.5*(50-10) = 30
        inst = _instance(fov_angle_override=55.0)
        _, _, max_r = resolve_effective_fov(inst, model)
        assert max_r == pytest.approx(30.0)

    def test_both_overrides_used_directly(self):
        model = _varifocal_model(
            fov_angle_wide=90.0, max_range_wide=10.0,
            fov_angle_tele=20.0, max_range_tele=50.0,
        )
        inst = _instance(fov_angle_override=45.0, max_range_override=99.0)
        fov, _, max_r = resolve_effective_fov(inst, model)
        assert fov == 45.0
        assert max_r == 99.0

    def test_min_range_override_applied_for_varifocal(self):
        model = _varifocal_model(min_range=0.0)
        inst = _instance(min_range_override=3.0)
        _, min_r, _ = resolve_effective_fov(inst, model)
        assert min_r == 3.0
