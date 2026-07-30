import uuid

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Career(Base):
    __tablename__ = "careers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(220), nullable=False)

    location: Mapped[str] = mapped_column(String(120), nullable=False)

    type: Mapped[str] = mapped_column(String(60), nullable=False)

    summary: Mapped[str] = mapped_column(String(500), nullable=False)

    responsibilities: Mapped[list[str]] = mapped_column(
        ARRAY(String(300)), nullable=False, default=list
    )

    is_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
