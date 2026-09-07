import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class ServiceBase(CamelModel):
    slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=220)
    short_description: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1, max_length=1000)
    icon: str | None = Field(default=None, max_length=60)
    outcomes: list[str] = Field(default_factory=list)


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(CamelModel):
    slug: str | None = Field(default=None, max_length=160)
    title: str | None = Field(default=None, max_length=220)
    short_description: str | None = Field(default=None, max_length=300)
    description: str | None = Field(default=None, max_length=1000)
    icon: str | None = Field(default=None, max_length=60)
    outcomes: list[str] | None = None


class ServiceRead(ServiceBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
