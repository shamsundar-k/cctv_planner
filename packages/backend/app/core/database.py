import logging

import motor.motor_asyncio
import redis.asyncio as aioredis
from beanie import init_beanie

from app.models.camera_instance import CameraInstance
from app.models.camera_model import CameraModel
from app.models.invite_token import InviteToken
from app.models.project import Project
from app.models.user import User
from app.models.zone import Zone

from .config import settings

logger = logging.getLogger(__name__)

motor_client: motor.motor_asyncio.AsyncIOMotorClient | None = None
redis_client: aioredis.Redis | None = None


async def init_db() -> None:
    global motor_client, redis_client

    # MongoDB via Motor + Beanie
    motor_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
    db = motor_client.get_default_database()
    await motor_client.admin.command("ping")
    await init_beanie(
        database=db,
        document_models=[User, InviteToken, CameraModel, Project, CameraInstance, Zone],
    )
    logger.info("MongoDB connected: %s", db.name)

    # Redis
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    logger.info("Redis connected")


async def close_db() -> None:
    if motor_client:
        motor_client.close()
    if redis_client:
        await redis_client.aclose()
