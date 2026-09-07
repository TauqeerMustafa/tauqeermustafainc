import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class DocumentFile(Base):
    """The bytes behind a vault document.

    Deliberately a separate table rather than a column on ``documents``: the
    vault list endpoints select whole ``Document`` rows, so a BYTEA column there
    would drag every payslip's contents into memory just to render a card. One
    row per document, read only by the download route.

    Documents that point at an external link keep ``file_url`` and simply have no
    row here.
    """

    __tablename__ = "document_files"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(
        String(150), nullable=False, server_default="application/octet-stream"
    )
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
