import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel
from app.schemas.auth import UserRead


class ClientRegisterRequest(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    phone: str = Field(min_length=7, max_length=40)


class ClientRegisterResponse(CamelModel):
    user_id: uuid.UUID
    email: str
    phone: str
    email_verification_required: bool = True
    phone_verification_required: bool = True
    message: str


class SendCodeRequest(CamelModel):
    user_id: uuid.UUID
    channel: str = Field(pattern="^(email|phone)$")


class CodeSentResponse(CamelModel):
    channel: str
    expires_in_seconds: int
    debug_code: str | None = None


class CodeVerificationResponse(CamelModel):
    channel: str
    verified: bool
    email_verified: bool
    phone_verified: bool
    access_token: str | None = None
    user: UserRead | None = None


class VerifyCodeRequest(CamelModel):
    user_id: uuid.UUID
    channel: str = Field(pattern="^(email|phone)$")
    code: str = Field(min_length=6, max_length=6, pattern="^\\d{6}$")


class GooglePhoneStartRequest(CamelModel):
    session: str = Field(min_length=20)
    phone: str = Field(min_length=7, max_length=40)


class GooglePhoneVerifyRequest(CamelModel):
    session: str = Field(min_length=20)
    code: str = Field(min_length=6, max_length=6, pattern="^\\d{6}$")


class ClientLoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class ClientLoginResponse(CamelModel):
    access_token: str
    user: UserRead


class ClientProjectRead(CamelModel):
    id: uuid.UUID
    name: str
    status: str
    summary: str | None = None
    next_milestone: str | None = None
    progress: int
    created_at: datetime
    updated_at: datetime


class ClientMessageRead(CamelModel):
    id: uuid.UUID
    project_id: uuid.UUID | None = None
    author_name: str
    body: str
    created_at: datetime


class ClientOverview(CamelModel):
    user: UserRead
    projects: list[ClientProjectRead]
    messages: list[ClientMessageRead]
    unread_messages: int
