import logging

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User

logger = logging.getLogger(__name__)


async def seed_first_admin() -> None:
    existing = await User.find_one(User.system_role == "admin")
    if existing:
        return

    if settings.FIRST_ADMIN_PASSWORD == "admin123":
        logger.warning(
            "SECURITY WARNING: First admin is using the default password 'admin123'. "
            "Change FIRST_ADMIN_PASSWORD immediately."
        )

    admin = User(
        email=settings.FIRST_ADMIN_EMAIL,
        full_name="Admin",
        hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
        system_role="admin",
    )
    await admin.insert()
    logger.info("Seeded first admin account: %s", settings.FIRST_ADMIN_EMAIL)
    logger.info("Seeded first admin password: %s", settings.FIRST_ADMIN_PASSWORD)
