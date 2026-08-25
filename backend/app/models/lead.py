import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Lead(Base):
    """A sales lead owned by an exec. Status/source are stored as slugs and
    validated at the API layer (see app.schemas.crm) rather than as native
    Postgres enums, so new values never require a migration."""

    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(160), nullable=False)
    contact_title: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # cold_call | linkedin | referral | email | other
    source: Mapped[str] = mapped_column(String(40), nullable=False, default="other")
    industry: Mapped[str | None] = mapped_column(String(120), nullable=True)
    # new | contacted | follow_up | qualified | proposal_sent | won | lost
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="new", index=True)

    estimated_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    next_follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    assigned_exec_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    assigned_exec = relationship("User", foreign_keys=[assigned_exec_id], lazy="joined")
    activities = relationship(
        "LeadActivity",
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="LeadActivity.created_at.desc()",
    )


class LeadActivity(Base):
    """A timestamped entry on a lead's activity log: a note, a logged call,
    or an automatic status-change record."""

    __tablename__ = "lead_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # note | status_change | call | email | meeting
    type: Mapped[str] = mapped_column(String(40), nullable=False, default="note")
    body: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    lead = relationship("Lead", back_populates="activities")
    author = relationship("User", foreign_keys=[author_id], lazy="joined")
