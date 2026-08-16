from pydantic import BaseModel


class RootResponse(BaseModel):
    name: str
    version: str
    status: str


class HealthResponse(BaseModel):
    status: str
    environment: str


class VersionResponse(BaseModel):
    name: str
    version: str


class ConfigResponse(BaseModel):
    access_token_expire_minutes: int
    environment: str
    cors_origins: list[str]
