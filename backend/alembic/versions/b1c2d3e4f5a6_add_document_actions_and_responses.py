"""add document actions and responses

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-09-10 03:20:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "b1c2d3e4f5a6"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Add requires_action and action_note columns to documents table
    op.add_column(
        "documents",
        sa.Column("requires_action", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "documents",
        sa.Column("action_note", sa.Text(), nullable=True),
    )

    # 2. Create document_responses table
    op.create_table(
        "document_responses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["document_id"], ["documents.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint("document_id", "user_id", name="uq_document_user_response"),
    )
    op.create_index(
        "ix_document_responses_document_id", "document_responses", ["document_id"]
    )
    op.create_index(
        "ix_document_responses_user_id", "document_responses", ["user_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_document_responses_user_id", table_name="document_responses")
    op.drop_index("ix_document_responses_document_id", table_name="document_responses")
    op.drop_table("document_responses")
    op.drop_column("documents", "action_note")
    op.drop_column("documents", "requires_action")
