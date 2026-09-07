"""create scheduled_emails table

Server-side queue for delayed email delivery. A row is created when a user
schedules a message; an external cron POSTs /mail/scheduled/dispatch and every
row whose ``send_at`` has passed is sent via open.email and marked. Delivery is
independent of the sender's device being online — that is the whole reason the
queue is persisted here rather than timed in the browser.

Revision ID: f6a3c1d92e84
Revises: e5f2b8d3c1a9
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f6a3c1d92e84"
down_revision: str | None = "e5f2b8d3c1a9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "scheduled_emails",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mailbox_id", sa.String(length=255), nullable=False),
        sa.Column("from_address", sa.String(length=255), nullable=False),
        sa.Column("from_name", sa.String(length=255), nullable=True),
        sa.Column("to_addresses", sa.Text(), nullable=False),
        sa.Column("subject", sa.Text(), nullable=False, server_default=""),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("body_html", sa.Text(), nullable=True),
        sa.Column("send_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("delivery_id", sa.String(length=255), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_scheduled_emails_user_id", "scheduled_emails", ["user_id"])
    op.create_index("ix_scheduled_emails_send_at", "scheduled_emails", ["send_at"])
    # The dispatcher scans for due, still-pending rows on every tick; a partial
    # index keeps that scan cheap as sent/failed rows accumulate.
    op.create_index(
        "ix_scheduled_emails_pending_due",
        "scheduled_emails",
        ["send_at"],
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index("ix_scheduled_emails_pending_due", table_name="scheduled_emails")
    op.drop_index("ix_scheduled_emails_send_at", table_name="scheduled_emails")
    op.drop_index("ix_scheduled_emails_user_id", table_name="scheduled_emails")
    op.drop_table("scheduled_emails")
