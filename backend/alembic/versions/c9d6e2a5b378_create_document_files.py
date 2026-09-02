"""create document_files

The Document Vault could only ever hold a link: ``POST /documents/upload`` took a
``file_url`` string, so "Upload Document" had nothing to upload *to* and the
button in the portal did nothing. This table holds the actual bytes, so an admin
can pick a file from disk and every employee can download it back out.

Kept separate from ``documents`` on purpose — the vault list endpoints select
whole Document rows, and a BYTEA column there would load every file's contents
just to render a list of cards.

Revision ID: c9d6e2a5b378
Revises: b8c5d1f4a267
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "c9d6e2a5b378"
down_revision: str | None = "b8c5d1f4a267"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "document_files",
        sa.Column("document_id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column(
            "mime_type",
            sa.String(length=150),
            nullable=False,
            server_default="application/octet-stream",
        ),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("content", sa.LargeBinary(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["document_id"], ["documents.id"], ondelete="CASCADE"
        ),
    )


def downgrade() -> None:
    op.drop_table("document_files")
