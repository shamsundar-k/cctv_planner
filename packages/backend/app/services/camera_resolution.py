"""Resolve effective FOV parameters for a placed camera instance.

Use resolve_effective_fov() to obtain (fov_angle, min_range, max_range) values
ready to pass into compute_fov_polygon. This is the single place that understands
the difference between fixed and varifocal cameras from the GIS service's perspective.
"""

from app.models.camera_instance import CameraInstance
from app.models.camera_model import CameraModel, LensType


def resolve_effective_fov(
    instance: CameraInstance,
    model: CameraModel,
) -> tuple[float, float, float]:
    """Return (fov_angle, min_range, max_range) for compute_fov_polygon.

    Fixed camera:
      - fov_angle / max_range: instance override if set, else model value.

    Varifocal camera:
      - No override: defaults to wide-end values (largest observable area).
      - fov_angle_override only: max_range is linearly interpolated across the zoom envelope.
      - Both overrides: used directly (caller is responsible for valid range).
    """
    min_range = (
        instance.min_range_override
        if instance.min_range_override is not None
        else model.min_range
    )

    if model.lens_type == LensType.fixed:
        fov = instance.fov_angle_override if instance.fov_angle_override is not None else model.fov_angle
        rng = instance.max_range_override if instance.max_range_override is not None else model.max_range
        return (fov, min_range, rng)  # type: ignore[return-value]

    # Varifocal — envelope fields are guaranteed non-None by model validator
    fov_wide: float = model.fov_angle_wide  # type: ignore[assignment]
    fov_tele: float = model.fov_angle_tele  # type: ignore[assignment]
    rng_wide: float = model.max_range_wide  # type: ignore[assignment]
    rng_tele: float = model.max_range_tele  # type: ignore[assignment]

    if instance.fov_angle_override is None:
        # No zoom configured — use wide end (most conservative / largest coverage)
        return (fov_wide, min_range, rng_wide)

    fov = instance.fov_angle_override

    if instance.max_range_override is not None:
        return (fov, min_range, instance.max_range_override)

    # Interpolate max_range from the FOV position within the envelope.
    # t=0 at wide end, t=1 at tele end; FOV decreases as t increases.
    t = (fov_wide - fov) / (fov_wide - fov_tele)
    rng = rng_wide + t * (rng_tele - rng_wide)
    return (fov, min_range, rng)
