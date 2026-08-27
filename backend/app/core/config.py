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
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days default
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Client portal verification providers. Delivery stays disabled until the
    # corresponding production credentials are configured.
    client_portal_url: str = "http://localhost:3000"
    verification_code_ttl_minutes: int = 10
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_use_tls: bool = True
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None

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

    # Production security guards
    if resolved.environment == "production":
        if resolved.secret_key == "change-me-in-production":
            raise RuntimeError(
                "SECRET_KEY must be set to a strong random value in production. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        localhost_origins = [
            o for o in resolved.cors_origin_list if "localhost" in o or "127.0.0.1" in o
        ]
        if localhost_origins:
            import warnings
            warnings.warn(
                f"CORS_ORIGINS contains localhost addresses in production: {localhost_origins}. "
                "These should be replaced with real production domain(s).",
                stacklevel=2,
            )

    return resolved


settings = get_settings()

