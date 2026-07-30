import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class AnnouncementBase(CamelModel):
    title: str = Field(min_length=1, max_length=220)
    body: str = Field(min_length=1)
    is_published: bool = True


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(CamelModel):
    title: str | None = Field(default=None, max_length=220)
    body: str | None = None
    is_published: bool | None = None


class AnnouncementRead(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
