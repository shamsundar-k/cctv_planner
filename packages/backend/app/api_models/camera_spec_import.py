from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.api_models.camera.camera_spec import CameraSpecRecord
from app.api_models.camera_spec_export import CameraSpecExportModel


class CameraSpecImportValidation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    valid: bool
    errors: list[str]
    warnings: list[str]


class CameraSpecImportImagePreview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content_type: Literal["image/webp"] = "image/webp"
    data_base64: str
    sha256: str
    source: Literal["custom", "default"]


class CameraSpecImportPreviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: CameraSpecExportModel
    image: CameraSpecImportImagePreview
    source_id: str | None
    source_id_available: bool | None
    suggested_target_id: str | None
    requires_new_id: bool
    validation: CameraSpecImportValidation


class CameraSpecImportIdMapping(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_id: str | None = Field(None, pattern=r"^[0-9a-fA-F]{24}$")
    target_id: str = Field(..., pattern=r"^[0-9a-fA-F]{24}$")


class CameraSpecImportResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    camera: CameraSpecRecord
    mapping: CameraSpecImportIdMapping
