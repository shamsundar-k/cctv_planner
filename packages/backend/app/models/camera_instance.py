"""Beanie document for a camera placed on a project map.

Installation parameters (height, tilt_angle, focal_length_chosen) capture
the physical mounting configuration for this specific placement. The frontend
uses these together with the linked CameraModel's lens/sensor specs to compute
Stage 1 geometric coverage and Stage 2 DORI performance.
"""

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from .camera_model import CameraModel
from .project import Project


class CameraInstance(Document):
    uid: str
    project: Link[Project]
    camera_model: Link[CameraModel]
    label: str = ""
    lat: float
    lng: float
    bearing: float = 0.0                        # degrees, 0 = North (pan direction)

    # ── Installation parameters ───────────────────────────────────────────────
    camera_height: float = Field(default=5.0, gt=0)    # m — lens height above ground
    tilt_angle: float = 30.0                    # ° — downward tilt from horizontal
    focal_length_chosen: float | None = None    # mm — selected zoom; None = focal_length_min

    # ── DORI parameters ───────────────────────────────────────────────────────
    target_distance: float | None = None        # m — distance to surveillance target; None = unset
    target_height: float = Field(default=1.5, gt=0)  # m — height of target subject (IEC EN 62676-4)

    colour: str = "#3B82F6"                     # hex colour for FOV rendering
    visible: bool = True
    fov_visible_geojson: dict | None = None             # computed GeoJSON Polygon (frontend)
    fov_ir_geojson: dict | None = None  
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "camera_instances"
        indexes = [
            "project",
            IndexModel(
                [("project.$id", ASCENDING), ("client_id", ASCENDING)],
                unique=True,
            ),
        ]
