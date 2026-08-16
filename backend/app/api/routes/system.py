from fastapi import APIRouter

from app.core.config import settings
from app.schemas.system import ConfigResponse, HealthResponse, RootResponse, VersionResponse

router = APIRouter(tags=["system"])


@router.get("/", response_model=RootResponse)
def root() -> RootResponse:
    return RootResponse(
        name=settings.app_name,
        version=settings.app_version,
        status="ok",
    )


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.environment,
    )


@router.get("/version", response_model=VersionResponse)
def version() -> VersionResponse:
    return VersionResponse(
        name=settings.app_name,
        version=settings.app_version,
    )


@router.get("/config", response_model=ConfigResponse)
def config() -> ConfigResponse:
    """Debug endpoint to verify environment configuration."""
    return ConfigResponse(
        access_token_expire_minutes=settings.access_token_expire_minutes,
        environment=settings.environment,
        cors_origins=settings.cors_origin_list,
    )
