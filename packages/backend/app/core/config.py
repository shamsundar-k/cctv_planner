from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

    MONGO_URI: str
    JWT_SECRET: str = "change-me"
    JWT_ACCESS_TTL_MINUTES: int = 15
    JWT_REFRESH_TTL_DAYS: int = 7
    INVITE_TOKEN_TTL_HOURS: int = 72
    FIRST_ADMIN_EMAIL: str 
    FIRST_ADMIN_PASSWORD: str 
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    CAMERA_IMAGE_ROOT: Path = Path("app/static/camera-images")
    CAMERA_IMAGE_MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024
    CAMERA_IMAGE_MAX_SOURCE_WIDTH: int = 2000
    CAMERA_IMAGE_MAX_SOURCE_HEIGHT: int = 2000
    CAMERA_IMAGE_MAX_DECODED_PIXELS: int = 4_000_000
    CAMERA_IMAGE_MIN_SOURCE_WIDTH: int = 64
    CAMERA_IMAGE_MIN_SOURCE_HEIGHT: int = 64
    CAMERA_IMAGE_OUTPUT_WIDTH: int = 600
    CAMERA_IMAGE_OUTPUT_HEIGHT: int = 600
    CAMERA_MODEL_ARCHIVE_MAX_UPLOAD_BYTES: int = 8 * 1024 * 1024
    CAMERA_MODEL_ARCHIVE_MAX_DECOMPRESSED_BYTES: int = 8 * 1024 * 1024
    CAMERA_MODEL_ARCHIVE_MAX_JSON_BYTES: int = 64 * 1024
    CAMERA_MODEL_ARCHIVE_MAX_JSON_DEPTH: int = 10
    CAMERA_MODEL_ARCHIVE_VALIDATION_TIMEOUT_SECONDS: float = 10.0


settings = Settings()
