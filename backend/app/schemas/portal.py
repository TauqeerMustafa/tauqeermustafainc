import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel
from app.schemas.auth import UserRead


class ClientRegisterRequest(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    phone: str | None = Field(default=None, max_length=40)


class ClientRegisterResponse(CamelModel):
    user_id: uuid.UUID
    email: str
    phone: str | None = None
    email_verification_required: bool = True
    phone_verification_required: bool = False
    message: str


class SendCodeRequest(CamelModel):
    user_id: uuid.UUID
    channel: str = Field(default="email", pattern="^email$")


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
    channel: str = Field(default="email", pattern="^email$")
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
    # Lets the client portal tell a reply from the team apart from its own note.
    from_team: bool = False
    read_at: datetime | None = None


class ClientOverview(CamelModel):
    user: UserRead
    projects: list[ClientProjectRead]
    messages: list[ClientMessageRead]
    unread_messages: int


class MessagesReadResponse(CamelModel):
    marked_read: int


class ClientThreadMessage(CamelModel):
    """One message in the staff-side inbox, with enough context to answer it."""

    id: uuid.UUID
    client_id: uuid.UUID
    client_name: str
    client_email: str
    project_id: uuid.UUID | None = None
    author_name: str
    # False when the client wrote it, True when it is a reply from the team.
    from_team: bool
    body: str
    created_at: datetime
    read_at: datetime | None = None


class ClientThread(CamelModel):
    """A client's whole conversation, newest message first."""

    client_id: uuid.UUID
    client_name: str
    client_email: str
    last_message_at: datetime | None = None
    # Client notes with no team reply after them — the queue staff must work.
    awaiting_reply: int
    messages: list[ClientThreadMessage]
