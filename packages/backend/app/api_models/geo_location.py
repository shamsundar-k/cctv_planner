from pydantic import BaseModel, Field


class GeoLocation(BaseModel):
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude in decimal degrees",
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude in decimal degrees",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                }
            ]
        }
    }
