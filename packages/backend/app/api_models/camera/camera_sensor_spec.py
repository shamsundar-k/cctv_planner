from pydantic import BaseModel, Field


class Resolution(BaseModel):
    horizontal: int = Field(..., gt=0, description="Horizontal resolution in pixels")
    vertical: int = Field(..., gt=0, description="Vertical resolution in pixels")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "horizontal": 1920,
                    "vertical": 1080,
                },
                {
                    "horizontal": 3840,
                    "vertical": 2160,
                },
            ]
        }
    }


class CameraSensorSpec(BaseModel):
    resolution: Resolution
    megapixel: float | None = Field(None, gt=0, description="Optional sensor resolution in megapixels")
    sensor_size: str | None = Field(
        None,
        description="Optional sensor size, for example 1/2.8 inch",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "resolution": {
                        "horizontal": 1920,
                        "vertical": 1080,
                    },
                    "megapixel": 2.0,
                    "sensor_size": "1/2.8 inch",
                },
                {
                    "resolution": {
                        "horizontal": 3840,
                        "vertical": 2160,
                    },
                    "megapixel": 8.0,
                    "sensor_size": None,
                },
            ]
        }
    }
