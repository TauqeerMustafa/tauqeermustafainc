import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class BlogBase(CamelModel):
    slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=220)
    excerpt: str = Field(min_length=1, max_length=400)
    content: str = ""
    category: str = Field(min_length=1, max_length=80)
    is_published: bool = True


class BlogCreate(BlogBase):
    pass


class BlogUpdate(CamelModel):
    slug: str | None = Field(default=None, max_length=160)
    title: str | None = Field(default=None, max_length=220)
    excerpt: str | None = Field(default=None, max_length=400)
    content: str | None = None
    category: str | None = Field(default=None, max_length=80)
    is_published: bool | None = None


class BlogRead(BlogBase):
    id: uuid.UUID
    published_at: datetime
    created_at: datetime
    updated_at: datetime
