"""MongoDB (Motor + Beanie) connection lifecycle."""

import logging

import motor.motor_asyncio
from beanie import init_beanie

from app.db_schemas.camera_placement import CameraPlacementDocument
from app.db_schemas.camera_specification import CameraSpecification
from app.db_schemas.project import Project
from app.db_schemas.user import User
from app.models.camera import Camera
from app.models.camera_model import CameraModel
from app.models.invite_token import InviteToken
from app.models.password_reset_request import PasswordResetRequest
from app.models.refresh_token import RefreshToken

from .config import settings

logger = logging.getLogger(__name__)

motor_client: motor.motor_asyncio.AsyncIOMotorClient | None = None


async def init_db() -> None:
    global motor_client

    # MongoDB via Motor + Beanie
    motor_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
    db = motor_client.get_default_database()
    await motor_client.admin.command("ping")
    await init_beanie(
        database=db,
        document_models=[
            User,
            InviteToken,
            PasswordResetRequest,
            RefreshToken,
            CameraModel,
            CameraSpecification,
            Project,
            CameraPlacementDocument,
            Camera,
            
        ],
    )
    logger.info("MongoDB connected: %s", db.name)


async def close_db() -> None:
    if motor_client:
        motor_client.close()
