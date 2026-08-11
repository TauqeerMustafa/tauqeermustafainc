from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Anchor to backend/.env regardless of the process's current working directory
# (e.g. running `alembic upgrade head` from the repo root vs. from backend/).
# This file is optional: local development uses it, but on a PaaS (Render,
# Railway, Fly.io, etc.) environment variables are injected directly by the
# platform and no .env file exists on disk - pydantic-settings reads those
# real env vars natively, so we must not require the file to be present.
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
        env_file=_ENV_FILE if _ENV_FILE.exists() else None,
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

    # Guardrails only apply when running locally against the default/dev
    # database URL. In a real deployment, DATABASE_URL is set via the
    # platform's env vars and won't match this placeholder, so this check
    # never fires there - it only protects against forgetting to configure
    # a local .env file during development.
    if (
        not _ENV_FILE.exists()
        and resolved.environment == "development"
        and "localhost:5432/tauqeer_inc" in resolved.database_url
    ):
        raise RuntimeError(
            f"No backend/.env file found and no DATABASE_URL environment "
            f"variable is set. For local development, copy backend/.env.example "
            f"to backend/.env and set your real DATABASE_URL. For a deployed "
            f"environment, set DATABASE_URL (and SECRET_KEY, CORS_ORIGINS, "
            f"ENVIRONMENT) as real environment variables in your hosting "
            f"platform's dashboard instead."
        )
    return resolved


settings = get_settings()
