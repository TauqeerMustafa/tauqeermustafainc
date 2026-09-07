import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel


class ContactCreate(CamelModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    company: str | None = Field(default=None, max_length=160)
    message: str = Field(min_length=1)


class ContactRead(CamelModel):
    id: uuid.UUID
    name: str
    email: str
    company: str | None
    message: str
    is_read: bool
    created_at: datetime


class ContactUpdate(CamelModel):
    is_read: bool
