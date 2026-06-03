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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "distance": 40.0,
                    "height": 1.5,
                }
            ]
        }
    }
