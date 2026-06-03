from pydantic import BaseModel, Field

from app.api_models.geo_location import GeoLocation


class CoverageArea(BaseModel):
    points: list[GeoLocation] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Four GIS points defining the camera coverage area",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "points": [
                        {"latitude": 40.7128, "longitude": -74.0060},
                        {"latitude": 40.7130, "longitude": -74.0055},
                        {"latitude": 40.7125, "longitude": -74.0050},
                        {"latitude": 40.7122, "longitude": -74.0057},
                    ]
                }
            ]
        }
    }
