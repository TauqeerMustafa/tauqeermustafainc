"""add open.email mailbox columns to users

Adds ``openemail_mailbox_id`` and ``openemail_address`` to ``users``. When an
admin creates a user we auto-provision an open.email mailbox and store its id
and primary address here. Both are nullable so existing rows and users created
while the API key is absent remain valid.

Revision ID: d4e1a7c9b2f3
Revises: c3f5a9d21b47
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "d4e1a7c9b2f3"
down_revision: str | None = "c3f5a9d21b47"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("openemail_mailbox_id", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("openemail_address", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "openemail_address")
    op.drop_column("users", "openemail_mailbox_id")
