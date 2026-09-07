"""Role-based access control: canonical slugs + runtime permission lookup.

The role/permission rows are seeded by the Alembic migration
``9a1c4d2b7e10_create_crm_tables``. These constants are the names the API
checks at runtime and MUST stay in sync with that seed. Because permissions
live in the database, adding a new role (or re-granting permissions) is a data
change, not a code change.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role import Permission, RolePermission
from app.models.user import User

# ── Role slugs ────────────────────────────────────────────────────────────────
ROLE_ADMIN = "admin"
ROLE_TEAM_LEAD = "team_lead"
ROLE_EXEC = "exec"
ROLE_MEMBER = "member"  # ordinary staff / "Employee" — seeded by e5f2b8d3c1a9
ROLE_CLIENT = "client"  # client-portal access — seeded by b7c2d8e4f901

# ── Permission slugs ──────────────────────────────────────────────────────────
P_LEADS_READ_OWN = "leads.read.own"
P_LEADS_READ_TEAM = "leads.read.team"
P_LEADS_READ_ALL = "leads.read.all"
P_LEADS_CREATE = "leads.create"
P_LEADS_UPDATE_OWN = "leads.update.own"
P_LEADS_UPDATE_TEAM = "leads.update.team"
P_LEADS_UPDATE_ALL = "leads.update.all"
P_LEADS_DELETE_OWN = "leads.delete.own"
P_LEADS_DELETE_ALL = "leads.delete.all"
P_LEADS_EXPORT_OWN = "leads.export.own"
P_LEADS_EXPORT_TEAM = "leads.export.team"
P_LEADS_EXPORT_ALL = "leads.export.all"
P_USERS_APPROVE = "users.approve"
P_USERS_MANAGE = "users.manage"
P_TEAMS_MANAGE = "teams.manage"
P_ROLES_MANAGE = "roles.manage"


def get_user_permissions(db: Session, user: User) -> set[str]:
    """All permission slugs granted to a user through their role."""
    if user.role_id is None:
        return set()
    rows = db.execute(
        select(Permission.slug)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == user.role_id)
    ).scalars().all()
    return set(rows)


def scope_for(perms: set[str], base: str) -> str | None:
    """Widest scope a user holds within a ``<base>.{all,team,own}`` family.

    Returns 'all', 'team', 'own', or None (no access). e.g. base="leads.read".
    """
    if f"{base}.all" in perms:
        return "all"
    if f"{base}.team" in perms:
        return "team"
    if f"{base}.own" in perms:
        return "own"
    return None
