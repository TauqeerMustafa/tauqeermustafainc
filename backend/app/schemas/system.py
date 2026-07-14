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
