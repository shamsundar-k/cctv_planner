"""Beanie document for survey projects. Fields: name, description, owner (User link), collaborators (list of {user_id, role}), created_at, updated_at."""

from datetime import datetime, timezone
from enum import Enum

from beanie import Document, Link
from pydantic import Field

from .user import User


class CollaboratorRole(str, Enum):
    editor = "editor"
    viewer = "viewer"


class Collaborator(Link[User]):
    role: CollaboratorRole = CollaboratorRole.viewer


class Project(Document):
    name: str
    description: str = ""
    owner: Link[User]
    collaborators: list[dict] = Field(default_factory=list)
    # Each entry: {"user_id": str, "role": CollaboratorRole}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"
