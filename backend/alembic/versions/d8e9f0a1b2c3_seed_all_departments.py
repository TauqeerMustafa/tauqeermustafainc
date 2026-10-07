"""seed all company departments and merge heads

Revision ID: d8e9f0a1b2c3
Revises: ('c1d2e3f4a5b6', 'e7d8f9a1b2c3', 'f1b7c3d9e482')
Create Date: 2026-10-06 03:00:00.000000
"""
import uuid
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "d8e9f0a1b2c3"
down_revision: tuple[str, ...] | str | None = (
    "c1d2e3f4a5b6",
    "e7d8f9a1b2c3",
    "f1b7c3d9e482",
)
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEPARTMENTS = [
    "General Inquiries",
    "Customer Support",
    "Sales & New Business",
    "Partnerships",
    "Marketing & Press",
    "Careers & Human Resources",
    "Billing & Invoices",
    "Legal & Privacy",
    "Engineering",
    "Product & Design",
]


def upgrade() -> None:
    # Ensure all 8 primary company departments (plus technical operations) are seeded idempotently
    insert_sql = sa.text(
        "INSERT INTO departments (id, name, created_at, updated_at) "
        "SELECT :id, :name, NOW(), NOW() "
        "WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = :name)"
    )
    for dept_name in DEPARTMENTS:
        op.execute(
            insert_sql.bindparams(
                id=uuid.uuid4(),
                name=dept_name,
            )
        )


def downgrade() -> None:
    # Only remove departments if not currently linked to employees
    delete_sql = sa.text(
        "DELETE FROM departments WHERE name = :name "
        "AND NOT EXISTS (SELECT 1 FROM employees WHERE employees.department_id = departments.id)"
    )
    for dept_name in DEPARTMENTS:
        op.execute(delete_sql.bindparams(name=dept_name))
