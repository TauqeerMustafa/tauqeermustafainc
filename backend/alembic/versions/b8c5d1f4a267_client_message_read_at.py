"""add client_messages.read_at

The client dashboard shows an "Open messages" counter, but ``/client/overview``
returned a hardcoded ``unread_messages=0`` because nothing tracked whether the
client had seen a reply — the badge could never be anything but zero.

This column is that tracking. A client's own outgoing notes are never "unread"
to them, so only inbound rows (``author_id != client_id``) are ever counted;
``POST /client/messages/read`` stamps them.

Existing rows are backfilled as read: they predate the counter, and surfacing a
pile of historical replies as new on the day of handover would be misleading.

Revision ID: b8c5d1f4a267
Revises: a7b4c2e18d95
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "b8c5d1f4a267"
down_revision: str | None = "a7b4c2e18d95"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "client_messages",
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
    )
    # Treat everything that already exists as seen — see the note above.
    op.execute("UPDATE client_messages SET read_at = created_at WHERE read_at IS NULL")


def downgrade() -> None:
    op.drop_column("client_messages", "read_at")
