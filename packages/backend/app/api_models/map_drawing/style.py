"""Renderer-independent presentation settings for map drawings."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


HEX_COLOUR_PATTERN = r"^#[0-9A-Fa-f]{6}$"


class DrawingStyle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    stroke_color: str = Field(default="#3B82F6", pattern=HEX_COLOUR_PATTERN)
    stroke_width: float = Field(default=3.0, ge=1, le=12, allow_inf_nan=False)
    stroke_opacity: float = Field(default=1.0, ge=0, le=1, allow_inf_nan=False)
    line_style: Literal["solid", "dashed", "dotted"] = "solid"
    fill_color: str = Field(default="#3B82F6", pattern=HEX_COLOUR_PATTERN)
    fill_opacity: float = Field(default=0.16, ge=0, le=1, allow_inf_nan=False)
