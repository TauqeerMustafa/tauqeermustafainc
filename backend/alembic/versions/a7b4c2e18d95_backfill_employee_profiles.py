"""backfill employee profiles for staff accounts

Revision ID: a7b4c2e18d95
Revises: f6a3c1d92e84
Create Date: 2026-09-02

The employee portal resolves the signed-in user through their ``employees`` row
and 403s ("Current user is not mapped to an employee profile") without one, so
every account created through Admin → Users — which only ever inserted a
``users`` row — reached a portal whose dashboard, attendance, leave and
documents pages all failed.

Route code now creates the profile at onboarding
(``app/services/onboarding.ensure_employee_profile``); this backfills the
accounts that predate that fix. Clients are excluded — they belong to the
client portal and have no HR record.

Idempotent: only users with no ``employees`` row are touched, so a re-run
inserts nothing.
"""

import uuid
from datetime import date

import sqlalchemy as sa
from alembic import op

revision = "a7b4c2e18d95"
down_revision = "f6a3c1d92e84"
branch_labels = None
depends_on = None


# Users lacking a profile, excluding clients. A user with no role row is treated
# as staff ('admin' when they are a superuser) to match the API's own fallback.
_MISSING = sa.text(
    """
    SELECT u.id, u.created_at
    FROM users u
    LEFT JOIN employees e ON e.user_id = u.id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE e.id IS NULL
      AND COALESCE(
            r.slug,
            CASE WHEN u.is_superuser THEN 'admin' ELSE 'member' END
          ) <> 'client'
    ORDER BY u.created_at
    """
)

_INSERT = sa.text(
    """
    INSERT INTO employees
        (id, user_id, employee_id_string, joining_date, status, created_at, updated_at)
    VALUES
        (:id, :user_id, :code, :joining_date, :status, now(), now())
    """
)


def upgrade() -> None:
    conn = op.get_bind()

    # Continue the existing TMI-0000 series rather than restarting it.
    used = conn.execute(
        sa.text("SELECT count(*) FROM employees WHERE employee_id_string LIKE 'TMI-%'")
    ).scalar() or 0

    for row in conn.execute(_MISSING).fetchall():
        used += 1
        code = f"TMI-{used:04d}"
        # Skip a code somebody already assigned by hand instead of failing the
        # migration on the unique index.
        while conn.execute(
            sa.text("SELECT 1 FROM employees WHERE employee_id_string = :code"),
            {"code": code},
        ).first():
            used += 1
            code = f"TMI-{used:04d}"

        conn.execute(
            _INSERT,
            {
                "id": str(uuid.uuid4()),
                "user_id": str(row[0]),
                "code": code,
                # Their account creation date is the best joining date we have.
                "joining_date": (row[1].date() if row[1] else date.today()),
                "status": "active",
            },
        )


def downgrade() -> None:
    # Intentionally a no-op: a backfilled profile is indistinguishable from one
    # created by hand, and deleting HR records to reverse a data migration would
    # cascade to attendance, leave and documents.
    pass
