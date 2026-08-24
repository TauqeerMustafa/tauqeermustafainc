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
    phone: str | None = None
    status: str = "approved"
    # Permission slugs granted by the user's role; drives role-based UI gating.
    permissions: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class LoginResponse(CamelModel):
    access_token: str
    user: UserRead
