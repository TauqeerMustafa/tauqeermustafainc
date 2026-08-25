"""create client portal tables and verification fields

Revision ID: b7c2d8e4f901
Revises: 9a1c4d2b7e10
"""
import uuid
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "b7c2d8e4f901"
down_revision: str | None = "9a1c4d2b7e10"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("phone_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("google_subject", sa.String(length=255), nullable=True))
    op.create_index("ix_users_google_subject", "users", ["google_subject"], unique=True)

    op.create_table(
        "verification_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("channel", sa.String(length=20), nullable=False),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_verification_codes_user_id", "verification_codes", ["user_id"])

    op.create_table(
        "client_projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="discovery"),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("next_milestone", sa.String(length=200), nullable=True),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_client_projects_client_id", "client_projects", ["client_id"])

    op.create_table(
        "client_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("client_projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_client_messages_client_id", "client_messages", ["client_id"])
    op.create_index("ix_client_messages_project_id", "client_messages", ["project_id"])

    op.execute(
        sa.text(
            "INSERT INTO roles (id, slug, name, hierarchy_level, description, is_system) "
            "SELECT :role_id, 'client', 'Client', 1, 'Client portal access', true "
            "WHERE NOT EXISTS (SELECT 1 FROM roles WHERE slug = 'client')"
        ).bindparams(role_id=uuid.uuid4())
    )


def downgrade() -> None:
    op.drop_index("ix_client_messages_project_id", table_name="client_messages")
    op.drop_index("ix_client_messages_client_id", table_name="client_messages")
    op.drop_table("client_messages")
    op.drop_index("ix_client_projects_client_id", table_name="client_projects")
    op.drop_table("client_projects")
    op.drop_index("ix_verification_codes_user_id", table_name="verification_codes")
    op.drop_table("verification_codes")
    op.drop_index("ix_users_google_subject", table_name="users")
    op.drop_column("users", "google_subject")
    op.drop_column("users", "phone_verified_at")
    op.drop_column("users", "email_verified_at")
