"""renumber staff numbers into the 006001 series

Revision ID: d2f8b6a3c514
Revises: f1b7c3d9e482
Create Date: 2026-09-03

Staff numbers were issued as ``TMI-0001``, and accounts onboarded through
Admin → Users before that got none at all. Both now come from
``app/services/onboarding.next_employee_number`` as a six-digit number starting
at ``006001``; this moves the people already on the books into that series so
there is one format in the directory rather than two plus blanks.

Ordered by joining date so the earliest hire holds the lowest number.

Idempotent: only rows with no code or an old ``TMI-`` one are touched, and any
number already assigned by hand is skipped rather than overwritten, so a re-run
changes nothing.
"""

import sqlalchemy as sa
from alembic import op

revision = "d2f8b6a3c514"
down_revision = "f1b7c3d9e482"
branch_labels = None
depends_on = None

# Must match app.services.onboarding.
_WIDTH = 6
_START = 6001

# Everyone who needs a number, oldest hire first. ``joining_date`` is the real
# ordering; ``created_at`` breaks ties and covers the rows that have no date.
_NEEDS_CODE = sa.text(
    """
    SELECT id
    FROM employees
    WHERE employee_id_string IS NULL
       OR employee_id_string = ''
       OR employee_id_string LIKE 'TMI-%'
    ORDER BY COALESCE(joining_date, created_at::date), created_at, id
    """
)

# Numbers already in the new series — assigned by hand, or by a previous run of
# this migration. Skipped rather than reused, so nothing collides on the unique
# index and no two people can end up sharing a number.
_ALREADY_NUMERIC = sa.text(
    "SELECT employee_id_string FROM employees WHERE employee_id_string ~ '^[0-9]+$'"
)

_ASSIGN = sa.text("UPDATE employees SET employee_id_string = :code WHERE id = :id")


def upgrade() -> None:
    conn = op.get_bind()

    taken = {row[0] for row in conn.execute(_ALREADY_NUMERIC).fetchall()}
    counter = _START

    for (employee_id,) in conn.execute(_NEEDS_CODE).fetchall():
        code = f"{counter:0{_WIDTH}d}"
        while code in taken:
            counter += 1
            code = f"{counter:0{_WIDTH}d}"

        conn.execute(_ASSIGN, {"code": code, "id": str(employee_id)})
        taken.add(code)
        counter += 1


def downgrade() -> None:
    # Intentionally a no-op. The old TMI- codes were not recorded anywhere else,
    # so there is nothing to restore them from, and clearing the new ones would
    # leave the directory with blanks instead of the numbers it had before.
    pass
