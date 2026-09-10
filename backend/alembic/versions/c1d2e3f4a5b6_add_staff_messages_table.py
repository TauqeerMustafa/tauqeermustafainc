"""add staff messages table

Revision ID: c1d2e3f4a5b6
Revises: b1c2d3e4f5a6
Create Date: 2026-09-10 10:15:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c1d2e3f4a5b6"
down_revision: str | None = "b1c2d3e4f5a6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "staff_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("channel", sa.String(length=50), server_default="admin-hr", nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_urgent", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("attachment_name", sa.String(length=255), nullable=True),
        sa.Column("attachment_size", sa.String(length=50), nullable=True),
        sa.Column("attachment_url", sa.String(length=500), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["author_id"], ["users.id"], ondelete="CASCADE"
        ),
    )
    op.create_index("ix_staff_messages_user_id", "staff_messages", ["user_id"])
    op.create_index("ix_staff_messages_author_id", "staff_messages", ["author_id"])
    op.create_index("ix_staff_messages_channel", "staff_messages", ["channel"])
    op.create_index("ix_staff_messages_created_at", "staff_messages", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_staff_messages_created_at", table_name="staff_messages")
    op.drop_index("ix_staff_messages_channel", table_name="staff_messages")
    op.drop_index("ix_staff_messages_author_id", table_name="staff_messages")
    op.drop_index("ix_staff_messages_user_id", table_name="staff_messages")
    op.drop_table("staff_messages")
