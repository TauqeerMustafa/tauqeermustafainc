"""seed the Employee (member) role

The RBAC seed (9a1c4d2b7e10) created only admin / team_lead / exec, and the
client portal migration added 'client'. There was no plain staff role, so the
"Add user" form could only make executives or team leads. This adds a
system 'member' role ("Employee") for ordinary staff — internal portal access
with no lead-management permissions. Idempotent, mirroring the client-role
insert so re-running is safe.

Revision ID: e5f2b8d3c1a9
Revises: d4e1a7c9b2f3
"""
import uuid
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "e5f2b8d3c1a9"
down_revision: str | None = "d4e1a7c9b2f3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        sa.text(
            "INSERT INTO roles (id, slug, name, hierarchy_level, description, is_system) "
            "SELECT :role_id, 'member', 'Employee', 5, "
            "'Staff member; internal portal access.', true "
            "WHERE NOT EXISTS (SELECT 1 FROM roles WHERE slug = 'member')"
        ).bindparams(role_id=uuid.uuid4())
    )


def downgrade() -> None:
    # Only remove the role if no user still references it, so the downgrade
    # can never orphan a FK.
    op.execute(
        sa.text(
            "DELETE FROM roles WHERE slug = 'member' "
            "AND NOT EXISTS (SELECT 1 FROM users WHERE users.role_id = roles.id)"
        )
    )
