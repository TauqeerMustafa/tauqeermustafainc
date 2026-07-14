from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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
        env_file=".env",
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
    return Settings()


settings = get_settings()
