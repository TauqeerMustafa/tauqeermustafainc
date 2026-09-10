import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class StaffMessage(Base):
    """Internal direct message thread between a staff member and a leadership desk."""
    __tablename__ = "staff_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # The staff member / employee owning this conversation thread
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The actual author of this message (either user_id or a manager/admin responding)
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The channel/desk id: "admin-hr", "head-eng", "head-product", "exec-desk", "general"
    channel: Mapped[str] = mapped_column(
        String(50), nullable=False, default="admin-hr", index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    attachment_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    attachment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    user = relationship("User", foreign_keys=[user_id], lazy="joined")
    author = relationship("User", foreign_keys=[author_id], lazy="joined")
