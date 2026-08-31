import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentAdmin, DatabaseSession
from app.core.security import hash_password
from app.models.role import Permission, Role, RolePermission
from app.models.team import Team
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedResult, Pagination
from app.schemas.crm import (
    AdminUserCreate,
    AdminUserRead,
    AssignPermissionsRequest,
    PermissionRead,
    RoleCreate,
    RoleRead,
    RoleUpdate,
    TeamRead,
    UpdateUserRequest,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _to_admin_user_read(user: User) -> AdminUserRead:
    return AdminUserRead(
        id=user.id,
        name=f"{user.first_name} {user.last_name}".strip(),
        email=user.email,
        phone=user.phone,
        role_slug=user.role.slug if user.role else ("admin" if user.is_superuser else None),
        role_name=user.role.name if user.role else ("Administrator" if user.is_superuser else None),
        status=user.status,
        team_id=user.team_id,
        team_name=user.team.name if user.team else None,
        openemail_address=user.openemail_address,
        approved_at=user.approved_at,
        created_at=user.created_at,
    )


def _get_role(db: DatabaseSession, role_slug: str) -> Role:
    role = db.scalar(select(Role).where(Role.slug == role_slug))
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{role_slug}' was not found",
        )
    return role


def _get_team(db: DatabaseSession, team_id: uuid.UUID | None) -> Team | None:
    if team_id is None:
        return None
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected team was not found",
        )
    return team


def _split_name(name: str) -> tuple[str, str]:
    parts = name.strip().split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def _to_role_read(role: Role) -> RoleRead:
    """Roles always travel with their permission list — the admin UI shows a
    per-role count and pre-checks the assignment boxes from it."""
    return RoleRead(
        id=role.id,
        slug=role.slug,
        name=role.name,
        hierarchy_level=role.hierarchy_level,
        description=role.description,
        is_system=role.is_system,
        permissions=[
            PermissionRead(id=p.id, slug=p.slug, description=p.description) for p in role.permissions
        ],
    )


@router.get("/users", response_model=ApiResponse[PaginatedResult[AdminUserRead]])
def list_users(
    db: DatabaseSession,
    _admin: CurrentAdmin,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=120),
    status_filter: str | None = Query(default=None, alias="status", max_length=20),
) -> ApiResponse[PaginatedResult[AdminUserRead]]:
    filters = []
    if search:
        term = f"%{search.strip()}%"
        filters.append((User.first_name + " " + User.last_name).ilike(term) | User.email.ilike(term))
    if status_filter:
        filters.append(User.status == status_filter)

    total = db.scalar(select(func.count()).select_from(User).where(*filters)) or 0
    users = db.scalars(
        select(User)
        .where(*filters)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    total_pages = (total + page_size - 1) // page_size if total else 0

    return ApiResponse(
        data=PaginatedResult(
            items=[_to_admin_user_read(user) for user in users],
            pagination=Pagination(page=page, page_size=page_size, total=total, total_pages=total_pages),
        )
    )


@router.post("/users", response_model=ApiResponse[AdminUserRead], status_code=status.HTTP_201_CREATED)
def create_user(
    payload: AdminUserCreate,
    db: DatabaseSession,
    admin: CurrentAdmin,
) -> ApiResponse[AdminUserRead]:
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    role = _get_role(db, payload.role_slug)
    _get_team(db, payload.team_id)
    first_name, last_name = _split_name(payload.name)
    user_status = payload.status.value
    now = datetime.now(timezone.utc)

    # Always auto-provision an open.email mailbox so every new user has a
    # working inbox at their account email. Non-fatal: if the key is absent,
    # the address is taken, or the API is down, the user is still created and
    # the address falls back to their account email.
    from app.services.openemail import provision_user_mailbox as provision_openemail_mailbox
    mailbox = provision_openemail_mailbox(payload.email)
    openemail_mailbox_id = mailbox.get("id") if mailbox else None
    openemail_address = (mailbox.get("primaryAddress") if mailbox else None) or payload.email

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        status=user_status,
        is_active=user_status == "approved",
        is_verified=user_status == "approved",
        is_superuser=role.slug == "admin",
        role_id=role.id,
        team_id=payload.team_id,
        openemail_mailbox_id=openemail_mailbox_id,
        openemail_address=openemail_address,
        approved_by_id=admin.id if user_status == "approved" else None,
        approved_at=now if user_status == "approved" else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ApiResponse(data=_to_admin_user_read(user), message="User created successfully")


@router.patch("/users/{user_id}", response_model=ApiResponse[AdminUserRead])
def update_user(
    user_id: uuid.UUID,
    payload: UpdateUserRequest,
    db: DatabaseSession,
    admin: CurrentAdmin,
) -> ApiResponse[AdminUserRead]:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id and payload.status and payload.status.value != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account",
        )

    if payload.role_slug is not None:
        role = _get_role(db, payload.role_slug)
        user.role_id = role.id
        user.is_superuser = role.slug == "admin"
    if payload.team_id is not None:
        _get_team(db, payload.team_id)
        user.team_id = payload.team_id
    elif "team_id" in payload.model_fields_set:
        user.team_id = None
    if payload.status is not None:
        user.status = payload.status.value
        user.is_active = payload.status.value == "approved"
        user.is_verified = payload.status.value == "approved"
        if payload.status.value == "approved" and user.approved_at is None:
            user.approved_by_id = admin.id
            user.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)
    return ApiResponse(data=_to_admin_user_read(user), message="User updated successfully")


@router.get("/roles", response_model=ApiResponse[list[RoleRead]])
def list_roles(db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[list[RoleRead]]:
    roles = db.scalars(
        select(Role)
        .options(selectinload(Role.permissions))
        .order_by(Role.hierarchy_level.desc(), Role.name.asc())
    ).all()
    return ApiResponse(data=[_to_role_read(role) for role in roles])


@router.get("/teams", response_model=ApiResponse[list[TeamRead]])
def list_teams(db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[list[TeamRead]]:
    teams = db.scalars(select(Team).order_by(Team.name.asc())).all()
    return ApiResponse(
        data=[
            TeamRead(
                id=team.id,
                name=team.name,
                team_lead_id=team.team_lead_id,
                team_lead_name=(
                    f"{team.team_lead.first_name} {team.team_lead.last_name}".strip()
                    if team.team_lead
                    else None
                ),
                member_count=db.scalar(select(func.count()).select_from(User).where(User.team_id == team.id)) or 0,
                created_at=team.created_at,
            )
            for team in teams
        ]
    )


@router.get("/metrics", response_model=ApiResponse[dict[str, int]])
def admin_metrics(db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[dict[str, int]]:
    total = db.scalar(select(func.count()).select_from(User)) or 0
    pending = db.scalar(select(func.count()).select_from(User).where(User.status == "pending")) or 0
    approved = db.scalar(select(func.count()).select_from(User).where(User.status == "approved")) or 0
    suspended = db.scalar(select(func.count()).select_from(User).where(User.status == "suspended")) or 0
    return ApiResponse(data={"total": total, "pending": pending, "approved": approved, "suspended": suspended})

@router.get("/permissions", response_model=ApiResponse[list[PermissionRead]])
def list_permissions(db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[list[PermissionRead]]:
    permissions = db.scalars(select(Permission).order_by(Permission.slug.asc())).all()
    return ApiResponse(
        data=[
            PermissionRead(
                id=p.id,
                slug=p.slug,
                description=p.description
            )
            for p in permissions
        ]
    )

@router.post("/roles", response_model=ApiResponse[RoleRead], status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[RoleRead]:
    existing = db.scalar(select(Role).where(Role.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=400, detail="Role with this slug already exists")

    role = Role(
        slug=payload.slug,
        name=payload.name,
        hierarchy_level=payload.hierarchy_level,
        description=payload.description,
        is_system=False
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    return ApiResponse(data=_to_role_read(role), message="Role created successfully")

@router.patch("/roles/{role_id}", response_model=ApiResponse[RoleRead])
def update_role(role_id: uuid.UUID, payload: RoleUpdate, db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[RoleRead]:
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if payload.name is not None:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description
    if payload.hierarchy_level is not None:
        role.hierarchy_level = payload.hierarchy_level

    db.commit()
    db.refresh(role)

    return ApiResponse(data=_to_role_read(role), message="Role updated successfully")

@router.delete("/roles/{role_id}", response_model=ApiResponse[dict])
def delete_role(role_id: uuid.UUID, db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[dict]:
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete a system role")
        
    # Check if role is in use
    in_use = db.scalar(select(func.count()).select_from(User).where(User.role_id == role_id))
    if in_use and in_use > 0:
        raise HTTPException(status_code=400, detail="Cannot delete role that is assigned to users")
        
    db.delete(role)
    db.commit()
    
    return ApiResponse(data={"deleted": True}, message="Role deleted successfully")

@router.post("/roles/{role_id}/permissions", response_model=ApiResponse[RoleRead])
def assign_role_permissions(role_id: uuid.UUID, payload: AssignPermissionsRequest, db: DatabaseSession, _admin: CurrentAdmin) -> ApiResponse[RoleRead]:
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=400, detail="System role permissions cannot be reassigned")

    # De-duplicate before the insert: the join table has a uniqueness constraint,
    # and a repeated id in the payload would otherwise abort the transaction.
    wanted = list(dict.fromkeys(payload.permission_ids))
    if wanted:
        known = set(db.scalars(select(Permission.id).where(Permission.id.in_(wanted))).all())
        missing = [str(pid) for pid in wanted if pid not in known]
        if missing:
            raise HTTPException(status_code=400, detail=f"Unknown permission ids: {', '.join(missing)}")

    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete(
        synchronize_session=False
    )
    for perm_id in wanted:
        db.add(RolePermission(role_id=role_id, permission_id=perm_id))

    db.commit()
    # The bulk delete above bypassed the identity map, so drop the cached
    # relationship and let it reload from the committed rows.
    db.expire(role, ["permissions"])

    return ApiResponse(data=_to_role_read(role), message="Permissions updated successfully")
