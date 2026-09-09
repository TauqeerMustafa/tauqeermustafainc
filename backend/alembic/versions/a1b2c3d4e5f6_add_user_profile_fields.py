"""add user profile fields

Revision ID: a1b2c3d4e5f6
Revises: e7d8f9a1b2c3, d2f8b6a3c514
Create Date: 2026-09-09 13:40:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: tuple[str, str] = ("e7d8f9a1b2c3", "d2f8b6a3c514")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(length=1000), nullable=True))
    op.add_column("users", sa.Column("bio", sa.String(length=1000), nullable=True))
    op.add_column("users", sa.Column("location", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("title", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("skills", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("github_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("linkedin_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("emergency_contact", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "emergency_contact")
    op.drop_column("users", "linkedin_url")
    op.drop_column("users", "github_url")
    op.drop_column("users", "skills")
    op.drop_column("users", "title")
    op.drop_column("users", "location")
    op.drop_column("users", "bio")
    op.drop_column("users", "avatar_url")

