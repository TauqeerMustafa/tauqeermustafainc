"""create crm tables (roles, permissions, teams, leads, lead_activities) + extend users

Revision ID: 9a1c4d2b7e10
Revises: 8f2a41c9d7b3
Create Date: 2026-08-24 00:00:00.000000
"""
import uuid
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "9a1c4d2b7e10"
down_revision: str | None = "8f2a41c9d7b3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


# ── RBAC seed data ─────────────────────────────────────────────────────────────
# Pre-generated ids so role_permissions can reference roles/permissions without
# a round-trip. Values must match the slugs the API checks (app/core/rbac.py).
_ROLES = [
    # (slug, name, hierarchy_level, description)
    ("admin", "Admin", 100, "Full access to all leads, users, teams, and roles."),
    ("team_lead", "Team Lead", 50, "Leads a team; sees own leads plus their team's."),
    ("exec", "Executive", 10, "Field sales; manages their own leads."),
]

_PERMISSIONS = [
    ("leads.read.own", "View own leads"),
    ("leads.read.team", "View the team's leads"),
    ("leads.read.all", "View all leads"),
    ("leads.create", "Create leads"),
    ("leads.update.own", "Edit own leads"),
    ("leads.update.team", "Edit the team's leads"),
    ("leads.update.all", "Edit any lead"),
    ("leads.delete.own", "Delete own leads"),
    ("leads.delete.all", "Delete any lead"),
    ("leads.export.own", "Export own leads"),
    ("leads.export.team", "Export the team's leads"),
    ("leads.export.all", "Export all leads"),
    ("users.approve", "Approve or reject registrations"),
    ("users.manage", "Assign, suspend, and manage users"),
    ("teams.manage", "Create and manage teams"),
    ("roles.manage", "Create and manage roles"),
]

_ROLE_PERMISSIONS = {
    "exec": [
        "leads.read.own",
        "leads.create",
        "leads.update.own",
        "leads.delete.own",
        "leads.export.own",
    ],
    "team_lead": [
        "leads.read.own",
        "leads.read.team",
        "leads.create",
        "leads.update.own",
        "leads.delete.own",
        "leads.export.own",
        "leads.export.team",
    ],
    "admin": [
        "leads.read.all",
        "leads.create",
        "leads.update.all",
        "leads.delete.all",
        "leads.export.all",
        "users.approve",
        "users.manage",
        "teams.manage",
        "roles.manage",
    ],
}


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(length=60), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("hierarchy_level", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=True),
        sa.Column("is_system", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_roles_slug"), "roles", ["slug"], unique=True)

    op.create_table(
        "permissions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_permissions_slug"), "permissions", ["slug"], unique=True)

    op.create_table(
        "role_permissions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("role_id", sa.UUID(), nullable=False),
        sa.Column("permission_id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["permission_id"], ["permissions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )
    op.create_index(op.f("ix_role_permissions_role_id"), "role_permissions", ["role_id"], unique=False)

    # teams.team_lead_id -> users (users already exists)
    op.create_table(
        "teams",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("team_lead_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["team_lead_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Extend users (teams now exists, so users.team_id can reference it)
    op.add_column("users", sa.Column("role_id", sa.UUID(), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(length=40), nullable=True))
    op.add_column("users", sa.Column("status", sa.String(length=20), nullable=False, server_default="approved"))
    op.add_column("users", sa.Column("team_id", sa.UUID(), nullable=True))
    op.add_column("users", sa.Column("approved_by_id", sa.UUID(), nullable=True))
    op.add_column("users", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key("fk_users_role_id", "users", "roles", ["role_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_users_team_id", "users", "teams", ["team_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_users_approved_by_id", "users", "users", ["approved_by_id"], ["id"], ondelete="SET NULL")

    op.create_table(
        "leads",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("company_name", sa.String(length=200), nullable=False),
        sa.Column("contact_person", sa.String(length=160), nullable=False),
        sa.Column("contact_title", sa.String(length=120), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("industry", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("estimated_value", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("next_follow_up_date", sa.Date(), nullable=True),
        sa.Column("assigned_exec_id", sa.UUID(), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["assigned_exec_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_leads_status"), "leads", ["status"], unique=False)
    op.create_index(op.f("ix_leads_assigned_exec_id"), "leads", ["assigned_exec_id"], unique=False)

    op.create_table(
        "lead_activities",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("author_id", sa.UUID(), nullable=True),
        sa.Column("type", sa.String(length=40), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_lead_activities_lead_id"), "lead_activities", ["lead_id"], unique=False)

    # ── Seed RBAC ───────────────────────────────────────────────────────────────
    roles_tbl = sa.table(
        "roles",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String),
        sa.column("name", sa.String),
        sa.column("hierarchy_level", sa.Integer),
        sa.column("description", sa.String),
        sa.column("is_system", sa.Boolean),
    )
    perms_tbl = sa.table(
        "permissions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String),
        sa.column("description", sa.String),
    )
    role_perms_tbl = sa.table(
        "role_permissions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("role_id", postgresql.UUID(as_uuid=True)),
        sa.column("permission_id", postgresql.UUID(as_uuid=True)),
    )

    role_ids = {slug: uuid.uuid4() for slug, *_ in _ROLES}
    perm_ids = {slug: uuid.uuid4() for slug, _ in _PERMISSIONS}

    op.bulk_insert(
        roles_tbl,
        [
            {
                "id": role_ids[slug],
                "slug": slug,
                "name": name,
                "hierarchy_level": level,
                "description": desc,
                "is_system": True,
            }
            for slug, name, level, desc in _ROLES
        ],
    )
    op.bulk_insert(
        perms_tbl,
        [{"id": perm_ids[slug], "slug": slug, "description": desc} for slug, desc in _PERMISSIONS],
    )
    op.bulk_insert(
        role_perms_tbl,
        [
            {"id": uuid.uuid4(), "role_id": role_ids[role_slug], "permission_id": perm_ids[perm_slug]}
            for role_slug, perm_slugs in _ROLE_PERMISSIONS.items()
            for perm_slug in perm_slugs
        ],
    )

    # ── Backfill existing users ──────────────────────────────────────────────────
    # Existing accounts predate this system and are trusted site admins: mark
    # them approved and give superusers the admin role, everyone else exec.
    op.execute(
        sa.text(
            "UPDATE users SET role_id = :admin_id, status = 'approved', approved_at = now() "
            "WHERE is_superuser = true AND role_id IS NULL"
        ).bindparams(admin_id=str(role_ids["admin"]))
    )
    op.execute(
        sa.text(
            "UPDATE users SET role_id = :exec_id, status = 'approved' "
            "WHERE is_superuser = false AND role_id IS NULL"
        ).bindparams(exec_id=str(role_ids["exec"]))
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_lead_activities_lead_id"), table_name="lead_activities")
    op.drop_table("lead_activities")
    op.drop_index(op.f("ix_leads_assigned_exec_id"), table_name="leads")
    op.drop_index(op.f("ix_leads_status"), table_name="leads")
    op.drop_table("leads")

    op.drop_constraint("fk_users_approved_by_id", "users", type_="foreignkey")
    op.drop_constraint("fk_users_team_id", "users", type_="foreignkey")
    op.drop_constraint("fk_users_role_id", "users", type_="foreignkey")
    op.drop_column("users", "approved_at")
    op.drop_column("users", "approved_by_id")
    op.drop_column("users", "team_id")
    op.drop_column("users", "status")
    op.drop_column("users", "phone")
    op.drop_column("users", "role_id")

    op.drop_table("teams")
    op.drop_index(op.f("ix_role_permissions_role_id"), table_name="role_permissions")
    op.drop_table("role_permissions")
    op.drop_index(op.f("ix_permissions_slug"), table_name="permissions")
    op.drop_table("permissions")
    op.drop_index(op.f("ix_roles_slug"), table_name="roles")
    op.drop_table("roles")
