from fastapi import APIRouter

from app.core.config import settings
from app.schemas.system import HealthResponse, RootResponse, VersionResponse

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
