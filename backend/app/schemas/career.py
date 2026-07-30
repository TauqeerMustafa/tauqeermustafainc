import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class CareerBase(CamelModel):
    slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=220)
    location: str = Field(min_length=1, max_length=120)
    type: str = Field(min_length=1, max_length=60)
    summary: str = Field(min_length=1, max_length=500)
    responsibilities: list[str] = Field(default_factory=list)
    is_open: bool = True


class CareerCreate(CareerBase):
    pass


class CareerUpdate(CamelModel):
    slug: str | None = Field(default=None, max_length=160)
    title: str | None = Field(default=None, max_length=220)
    location: str | None = Field(default=None, max_length=120)
    type: str | None = Field(default=None, max_length=60)
    summary: str | None = Field(default=None, max_length=500)
    responsibilities: list[str] | None = None
    is_open: bool | None = None


class CareerRead(CareerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
