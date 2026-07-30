import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)
    remember: bool = False


class UpdateProfileRequest(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=8)


class UserRead(CamelModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime


class LoginResponse(CamelModel):
    access_token: str
    user: UserRead
