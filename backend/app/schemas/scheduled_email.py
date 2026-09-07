"""Scheduled email payloads.

A user schedules a message from their own provisioned mailbox; the sender is
resolved server-side from the caller's account, never trusted from the client,
so only ``to``/``subject``/``body``/``sendAt`` are accepted on create.
"""

from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel


class ScheduledEmailCreate(CamelModel):
    to: list[EmailStr] = Field(..., min_length=1)
    subject: str = Field(default="", max_length=998)
    text: str | None = None
    html: str | None = None
    send_at: datetime
    # The mailbox to send from, as shown in the composer. Honored only for
    # admins (who have access to every org mailbox); members are always pinned
    # to their own provisioned mailbox server-side regardless of what's sent.
    mailbox_id: str | None = None
    from_address: EmailStr | None = None

    @field_validator("to")
    @classmethod
    def _dedupe(cls, v: list[EmailStr]) -> list[EmailStr]:
        # Preserve order, drop duplicates and blanks.
        seen: set[str] = set()
        out: list[EmailStr] = []
        for addr in v:
            key = str(addr).lower()
            if key and key not in seen:
                seen.add(key)
                out.append(addr)
        if not out:
            raise ValueError("At least one recipient is required")
        return out


class ScheduledEmailResponse(CamelModel):
    id: UUID
    from_address: str
    to: list[str]
    subject: str
    text: str | None = None
    html: str | None = None
    send_at: datetime
    status: str
    attempts: int
    error: str | None = None
    sent_at: datetime | None = None
    created_at: datetime


class DispatchResult(CamelModel):
    processed: int
    sent: int
    failed: int
