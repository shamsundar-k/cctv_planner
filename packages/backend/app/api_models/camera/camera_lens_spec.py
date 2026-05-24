from pydantic import BaseModel, model_validator

from .focal_length_spec import FocalLength
from .fov_spec import FOV
from .lens_type import LensType


class CameraLensSpec(BaseModel):
    lens_type: LensType
    focal_length: FocalLength
    h_fov: FOV
    v_fov: FOV

    @model_validator(mode="after")
    def validate_lens_consistency(self):
        if self.lens_type == LensType.FIXED:
            if self.focal_length.min != self.focal_length.max:
                raise ValueError("for fixed type, focal_length min and max must be equal")
            if self.h_fov.min != self.h_fov.max:
                raise ValueError("for fixed type, h_fov min and max must be equal")
            if self.v_fov.min != self.v_fov.max:
                raise ValueError("for fixed type, v_fov min and max must be equal")

        if self.lens_type == LensType.VARIFOCAL:
            if self.focal_length.min == self.focal_length.max:
                raise ValueError("for varifocal type, focal_length min and max must be different")
            if self.h_fov.min == self.h_fov.max:
                raise ValueError("for varifocal type, h_fov min and max must be different")
            if self.v_fov.min == self.v_fov.max:
                raise ValueError("for varifocal type, v_fov min and max must be different")

        return self

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "lens_type": "varifocal",
                    "focal_length": {"min": 2.8, "max": 12.0},
                    "h_fov": {"min": 35.0, "max": 95.0},
                    "v_fov": {"min": 20.0, "max": 52.0}
                },
                {
                    "lens_type": "fixed",
                    "focal_length": {"min": 4.0, "max": 4.0},
                    "h_fov": {"min": 78.0, "max": 78.0},
                    "v_fov": {"min": 42.0, "max": 42.0}
                }
            ]
        }
    }
