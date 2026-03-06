from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

    MONGO_URI: str
    REDIS_URL: str
    JWT_SECRET: str = "change-me"
    JWT_ACCESS_TTL_MINUTES: int = 15
    JWT_REFRESH_TTL_DAYS: int = 7
    INVITE_TOKEN_TTL_HOURS: int = 72
    FIRST_ADMIN_EMAIL: str = "admin@example.com"
    FIRST_ADMIN_PASSWORD: str = "changeme"
    FRONTEND_BASE_URL: str = "http://localhost:5173"


settings = Settings()
