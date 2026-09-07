"""give the Employee (member) role its own lead book

The member role was seeded (e5f2b8d3c1a9) with no lead permissions at all, so
an Employee hitting any ``/leads`` route was rejected by
``require_permission`` before scoping ever ran. That is wrong for staff who do
outbound work — interns and junior staff need to source and work leads.

Granted here: read / create / update / export at **own** scope only. Deleting
is deliberately withheld; a member advances or loses a lead by changing its
status, and destroying the record stays with admins so the funnel history
survives. Own scope means ``_narrow()`` in app/api/routes/lead.py filters every
query to ``assigned_exec_id == self``, so one member never sees another's book.

Idempotent on both halves: the INSERT skips grants that already exist and the
DELETE only removes these four rows, so re-running either direction is safe.

Revision ID: f1b7c3d9e482
Revises: c9d6e2a5b378
"""
import uuid
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "f1b7c3d9e482"
down_revision: str | None = "c9d6e2a5b378"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_ROLE_SLUG = "member"
_PERMISSIONS = (
    "leads.read.own",
    "leads.create",
    "leads.update.own",
    "leads.export.own",
)


def upgrade() -> None:
    for slug in _PERMISSIONS:
        # The permission rows themselves came from 9a1c4d2b7e10; this only
        # attaches them to the role. The NOT EXISTS guard also covers the
        # uq_role_permission constraint on a re-run.
        op.execute(
            sa.text(
                "INSERT INTO role_permissions (id, role_id, permission_id) "
                "SELECT :row_id, r.id, p.id FROM roles r, permissions p "
                "WHERE r.slug = :role_slug AND p.slug = :perm_slug "
                "AND NOT EXISTS ("
                "  SELECT 1 FROM role_permissions rp "
                "  WHERE rp.role_id = r.id AND rp.permission_id = p.id"
                ")"
            ).bindparams(row_id=uuid.uuid4(), role_slug=_ROLE_SLUG, perm_slug=slug)
        )


def downgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM role_permissions WHERE role_id = ("
            "  SELECT id FROM roles WHERE slug = :role_slug"
            ") AND permission_id IN ("
            "  SELECT id FROM permissions WHERE slug = ANY(:perm_slugs)"
            ")"
        ).bindparams(role_slug=_ROLE_SLUG, perm_slugs=list(_PERMISSIONS))
    )
