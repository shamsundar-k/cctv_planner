from pydantic import BaseModel, Field


class TargetData(BaseModel):
    distance: float = Field(
        default=40.0,
        gt=0,
        description="Target distance in meters",
    )
    height: float = Field(
        default=1.5,
        gt=0,
        description="Target height in meters",
    )
    focal_length: float | None = Field(
        default=None,
        gt=0,
        description="Selected lens focal length in millimeters",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "distance": 40.0,
                    "height": 1.5,
                    "focal_length": 4.0,
                }
            ]
        }
    }
