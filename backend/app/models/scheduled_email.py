import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ScheduledEmail(Base):
    """A message queued for future delivery via open.email.

    The whole point of this table is that delivery does NOT depend on the
    sender's browser or laptop being on: the row is persisted server-side and
    an external trigger (a cron that POSTs ``/mail/scheduled/dispatch``) sends
    every row whose ``send_at`` has passed. open.email has no native
    delayed-send parameter, so the queue lives here.

    ``mailbox_id`` / ``from_address`` are copied from the owning user's
    provisioned mailbox at schedule time so a client can never schedule mail
    "from" an address it does not own.
    """

    __tablename__ = "scheduled_emails"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # open.email routing, resolved from the owner's mailbox at creation.
    mailbox_id: Mapped[str] = mapped_column(String(255), nullable=False)
    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    from_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Recipients stored comma-separated; the API exposes them as a list.
    to_addresses: Mapped[str] = mapped_column(Text, nullable=False)
    subject: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    body_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_html: Mapped[str | None] = mapped_column(Text, nullable=True)

    # When to deliver, and the delivery lifecycle.
    send_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    # pending | sent | failed | canceled
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="pending", default="pending"
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0", default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", foreign_keys=[user_id], lazy="select")
