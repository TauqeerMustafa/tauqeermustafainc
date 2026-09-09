"""multi assignees and announcement images

Revision ID: e7d8f9a1b2c3
Revises: f6a3c1d92e84
Create Date: 2026-09-09 12:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "e7d8f9a1b2c3"
down_revision: str | None = "f6a3c1d92e84"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Add image_url to announcements
    op.add_column("announcements", sa.Column("image_url", sa.String(length=500), nullable=True))

    # 2. Create task_assignees association table
    op.create_table(
        "task_assignees",
        sa.Column("task_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["project_tasks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("task_id", "user_id"),
    )
    op.create_index("ix_task_assignees_task_id", "task_assignees", ["task_id"])
    op.create_index("ix_task_assignees_user_id", "task_assignees", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_task_assignees_user_id", table_name="task_assignees")
    op.drop_index("ix_task_assignees_task_id", table_name="task_assignees")
    op.drop_table("task_assignees")
    op.drop_column("announcements", "image_url")
