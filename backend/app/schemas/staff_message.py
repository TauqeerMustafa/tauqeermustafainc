import uuid
from datetime import datetime
from typing import Optional
from app.schemas.common import CamelModel


class StaffMessageCreate(CamelModel):
    channel: str = "admin-hr"
    body: str
    is_urgent: bool = False
    attachment_name: Optional[str] = None
    attachment_size: Optional[str] = None
    attachment_url: Optional[str] = None


class StaffMessageReply(CamelModel):
    channel: str = "admin-hr"
    body: str
    is_urgent: bool = False


class StaffMessageRead(CamelModel):
    id: uuid.UUID
    user_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    author_email: Optional[str] = None
    is_from_staff: bool
    channel: str
    body: str
    is_urgent: bool
    attachment_name: Optional[str] = None
    attachment_size: Optional[str] = None
    attachment_url: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime


class StaffThread(CamelModel):
    user_id: uuid.UUID
    employee_name: str
    employee_email: str
    job_title: Optional[str] = None
    department_name: Optional[str] = None
    last_message_at: Optional[datetime] = None
    last_message_preview: Optional[str] = None
    awaiting_reply: int
    has_urgent: bool
    channels: list[str]
    messages: list[StaffMessageRead]


class StaffUnreadCount(CamelModel):
    unread_count: int
