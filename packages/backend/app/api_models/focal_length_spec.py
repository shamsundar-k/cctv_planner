from pydantic import BaseModel, Field, model_validator


class FocalLength(BaseModel):
    min: float = Field(..., gt=0, description="Minimum focal length in mm")
    max: float = Field(..., gt=0, description="Maximum focal length in mm")

    @model_validator(mode="after")
    def validate_focal_length(self):
        if self.min > self.max:
            raise ValueError("min must be less than or equal to max")
        return self

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "min": 2.8,
                    "max": 12.0,
                },
                {
                    "min": 4.0,
                    "max": 4.0,
                }
            ]
        }
    }
