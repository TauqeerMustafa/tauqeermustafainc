from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Anchor to backend/.env regardless of the process's current working directory
# (e.g. running `alembic upgrade head` from the repo root vs. from backend/).
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "Tauqeer Inc Backend"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = Field(default=False, validation_alias="APP_DEBUG")
    log_level: str = "INFO"

    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/tauqeer_inc"
    )
    secret_key: str = Field(default="change-me-in-production")
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    resolved = Settings()
    if not _ENV_FILE.exists():
        raise RuntimeError(
            f"No .env file found at {_ENV_FILE}. "
            "Copy backend/.env.example to backend/.env and set your real DATABASE_URL."
        )
    if "localhost:5432/tauqeer_inc" in resolved.database_url:
        raise RuntimeError(
            f".env was found at {_ENV_FILE} but DATABASE_URL still points to the local "
            "default (localhost:5432/tauqeer_inc). Open that file and set DATABASE_URL "
            "to your real Supabase/Postgres connection string."
        )
    return resolved


settings = get_settings()
