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
    # Empty string clears the number; None leaves it untouched.
    phone: str | None = Field(default=None, max_length=40)
    avatar_url: str | None = Field(default=None, max_length=1000)
    bio: str | None = Field(default=None, max_length=1000)
    location: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=100)
    skills: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    emergency_contact: str | None = Field(default=None, max_length=255)
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=8)


class UserRead(CamelModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    phone: str | None = None
    status: str = "approved"
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = None
    title: str | None = None
    department: str | None = None
    skills: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    emergency_contact: str | None = None
    # Permission slugs granted by the user's role; drives role-based UI gating.
    permissions: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class LoginResponse(CamelModel):
    access_token: str
    user: UserRead
