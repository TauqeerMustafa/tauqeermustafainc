import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    phone_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    google_subject: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # ── CRM fields ───────────────────────────────────────────────────────────
    role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True
    )
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    # pending | approved | rejected | suspended. `is_active` stays in sync as
    # the login/auth gate: only approved users are active.
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="approved", default="approved"
    )
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── open.email mailbox ────────────────────────────────────────────────────
    # Provisioned automatically on user creation. ``address`` is the mailbox's
    # primary address (equal to ``email``); ``mailbox_id`` is the open.email id,
    # null when provisioning was skipped (missing key) or the address already
    # had a mailbox.
    openemail_mailbox_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    openemail_address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    role = relationship("Role", foreign_keys=[role_id], lazy="joined")
    team = relationship("Team", foreign_keys=[team_id], lazy="select")
    employee = relationship("Employee", back_populates="user", uselist=False, lazy="select", cascade="all, delete-orphan")
