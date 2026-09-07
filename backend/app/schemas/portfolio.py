import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class PortfolioBase(CamelModel):
    slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=220)
    summary: str = Field(min_length=1, max_length=500)
    category: str = Field(min_length=1, max_length=80)
    impact: str = ""
    technologies: list[str] = Field(default_factory=list)
    gallery: list[str] = Field(default_factory=list)


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(CamelModel):
    slug: str | None = Field(default=None, max_length=160)
    title: str | None = Field(default=None, max_length=220)
    summary: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=80)
    impact: str | None = None
    technologies: list[str] | None = None
    gallery: list[str] | None = None


class PortfolioRead(PortfolioBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
