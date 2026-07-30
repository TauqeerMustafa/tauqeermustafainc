import uuid

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(220), nullable=False)

    short_description: Mapped[str] = mapped_column(String(300), nullable=False)

    description: Mapped[str] = mapped_column(String(1000), nullable=False)

    icon: Mapped[str] = mapped_column(String(60), nullable=True)

    outcomes: Mapped[list[str]] = mapped_column(
        ARRAY(String(200)), nullable=False, default=list
    )

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
