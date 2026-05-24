from pydantic import BaseModel, Field, model_validator


class FOV(BaseModel):
    min: float = Field(..., gt=0, lt=180, description="Minimum field of view in degrees")
    max: float = Field(..., gt=0, lt=180, description="Maximum field of view in degrees")

    @model_validator(mode="after")
    def validate_fov_range(self):
        if self.min > self.max:
            raise ValueError("min must be less than or equal to max")
        return self

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "min": 35.0,
                    "max": 95.0,
                },
                {
                    "min": 78.0,
                    "max": 78.0,
                }
            ]
        }
    }
