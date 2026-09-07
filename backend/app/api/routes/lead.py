"""Leads / sales pipeline.

``Lead``, ``LeadActivity`` and their schemas already existed, but no router ever
exposed them — so the seeded ``leads.*`` permission family was enforced by
nothing and the management portal's Pipeline page had no endpoint to call.

Every read and write is scope-aware: ``scope_for()`` resolves the widest slice a
caller holds inside a ``leads.<verb>.{all,team,own}`` family and the query is
narrowed to match, so a lead owner sees their own book while a team lead sees
their team's. Admins bypass the permission check (see ``require_permission``)
and are treated as scope ``all``.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import DatabaseSession, is_admin, require_permission
from app.core.rbac import (
    P_LEADS_CREATE,
    P_LEADS_DELETE_ALL,
    P_LEADS_DELETE_OWN,
    P_LEADS_READ_ALL,
    P_LEADS_READ_OWN,
    P_LEADS_READ_TEAM,
    P_LEADS_UPDATE_ALL,
    P_LEADS_UPDATE_OWN,
    P_LEADS_UPDATE_TEAM,
    get_user_permissions,
    scope_for,
)
from app.models.lead import Lead, LeadActivity
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.crm import (
    LeadActivityCreate,
    LeadActivityRead,
    LeadCreate,
    LeadDetail,
    LeadPipelineResponse,
    LeadRead,
    LeadStatus,
    LeadUpdate,
    PipelineStage,
)

router = APIRouter(prefix="/leads", tags=["leads"])

LeadReader = Annotated[
    User,
    Depends(require_permission(P_LEADS_READ_OWN, P_LEADS_READ_TEAM, P_LEADS_READ_ALL)),
]
LeadCreator = Annotated[User, Depends(require_permission(P_LEADS_CREATE))]
LeadEditor = Annotated[
    User,
    Depends(require_permission(P_LEADS_UPDATE_OWN, P_LEADS_UPDATE_TEAM, P_LEADS_UPDATE_ALL)),
]
LeadDeleter = Annotated[
    User, Depends(require_permission(P_LEADS_DELETE_OWN, P_LEADS_DELETE_ALL))
]

# Funnel order matters: the pipeline endpoint returns stages in this sequence so
# the UI never has to know the business process to draw the columns left-to-right.
STAGE_ORDER: tuple[LeadStatus, ...] = (
    LeadStatus.new,
    LeadStatus.contacted,
    LeadStatus.follow_up,
    LeadStatus.qualified,
    LeadStatus.proposal_sent,
    LeadStatus.won,
    LeadStatus.lost,
)
STAGE_LABELS: dict[str, str] = {
    LeadStatus.new.value: "New",
    LeadStatus.contacted.value: "Contacted",
    LeadStatus.follow_up.value: "Follow up",
    LeadStatus.qualified.value: "Qualified",
    LeadStatus.proposal_sent.value: "Proposal sent",
    LeadStatus.won.value: "Won",
    LeadStatus.lost.value: "Lost",
}
CLOSED_STATUSES = (LeadStatus.won.value, LeadStatus.lost.value)


def _scope(db: Session, user: User, base: str) -> str:
    """Widest slice of the lead book this user may touch for ``base``.

    Admins are 'all' without a permission row, matching ``require_permission``'s
    bypass — otherwise an admin would pass the dependency and then be filtered
    down to the zero leads assigned to them.
    """
    if is_admin(user):
        return "all"
    return scope_for(get_user_permissions(db, user), base) or "own"


def _narrow(stmt: Select, db: Session, user: User, scope: str) -> Select:
    """Apply a read/write scope to a Lead select."""
    if scope == "all":
        return stmt
    if scope == "team" and user.team_id is not None:
        teammates = select(User.id).where(User.team_id == user.team_id)
        # Leads assigned to nobody stay invisible to team scope on purpose: an
        # unassigned lead belongs to no team, so it is an admin/all-scope concern.
        return stmt.where(
            or_(Lead.assigned_exec_id.in_(teammates), Lead.assigned_exec_id == user.id)
        )
    return stmt.where(Lead.assigned_exec_id == user.id)


def _exec_name(lead: Lead) -> Optional[str]:
    owner = lead.assigned_exec
    if owner is None:
        return None
    return f"{owner.first_name} {owner.last_name}".strip() or owner.email


def _author_name(activity: LeadActivity) -> Optional[str]:
    author = activity.author
    if author is None:
        return None
    return f"{author.first_name} {author.last_name}".strip() or author.email


def _to_activity_read(activity: LeadActivity) -> LeadActivityRead:
    return LeadActivityRead(
        id=activity.id,
        type=activity.type,
        body=activity.body,
        author_id=activity.author_id,
        author_name=_author_name(activity),
        created_at=activity.created_at,
    )


def _to_read(lead: Lead) -> LeadRead:
    return LeadRead(
        id=lead.id,
        company_name=lead.company_name,
        contact_person=lead.contact_person,
        contact_title=lead.contact_title,
        phone=lead.phone,
        email=lead.email,
        source=lead.source,
        industry=lead.industry,
        status=lead.status,
        # Numeric() comes back as Decimal, which is not JSON-serialisable and
        # which the float-typed schema would otherwise have to coerce implicitly.
        estimated_value=float(lead.estimated_value) if lead.estimated_value is not None else None,
        currency=lead.currency,
        next_follow_up_date=lead.next_follow_up_date,
        assigned_exec_id=lead.assigned_exec_id,
        assigned_exec_name=_exec_name(lead),
        created_by_id=lead.created_by_id,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


def _to_detail(lead: Lead) -> LeadDetail:
    return LeadDetail(
        **_to_read(lead).model_dump(),
        activities=[_to_activity_read(a) for a in lead.activities],
    )


@router.get("", response_model=ApiResponse[list[LeadRead]])
def list_leads(
    db: DatabaseSession,
    current_user: LeadReader,
    status_filter: str | None = Query(None, alias="status"),
    source: str | None = Query(None),
    assigned_exec_id: UUID | None = Query(None, alias="assignedExecId"),
    search: str | None = Query(None, alias="q", max_length=200),
    limit: int = Query(100, ge=1, le=500),
):
    scope = _scope(db, current_user, "leads.read")
    stmt = _narrow(select(Lead), db, current_user, scope)

    if status_filter:
        stmt = stmt.where(Lead.status == status_filter)
    if source:
        stmt = stmt.where(Lead.source == source)
    if assigned_exec_id:
        stmt = stmt.where(Lead.assigned_exec_id == assigned_exec_id)
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Lead.company_name.ilike(like),
                Lead.contact_person.ilike(like),
                Lead.email.ilike(like),
            )
        )

    leads = db.scalars(stmt.order_by(Lead.updated_at.desc()).limit(limit)).all()
    return ApiResponse(data=[_to_read(lead) for lead in leads])


@router.get("/pipeline", response_model=ApiResponse[LeadPipelineResponse])
def get_pipeline(db: DatabaseSession, current_user: LeadReader):
    """Funnel aggregate for the management portal's Pipeline page.

    Declared before ``/{lead_id}`` so the literal path wins the route match — a
    dynamic UUID segment registered first would swallow it and 422.
    """
    scope = _scope(db, current_user, "leads.read")
    today = datetime.now(timezone.utc).date()

    rows = db.execute(
        _narrow(
            select(Lead.status, func.count(Lead.id), func.coalesce(func.sum(Lead.estimated_value), 0)),
            db,
            current_user,
            scope,
        ).group_by(Lead.status)
    ).all()
    tally = {status_: (count, float(value)) for status_, count, value in rows}

    stages = [
        PipelineStage(
            status=stage.value,
            label=STAGE_LABELS[stage.value],
            count=tally.get(stage.value, (0, 0.0))[0],
            value=tally.get(stage.value, (0, 0.0))[1],
        )
        for stage in STAGE_ORDER
    ]
    # Any status outside STAGE_ORDER is still real data — surface it rather than
    # silently dropping rows and under-reporting the totals.
    for status_, (count, value) in tally.items():
        if status_ not in STAGE_LABELS:
            stages.append(
                PipelineStage(
                    status=status_,
                    label=status_.replace("_", " ").title(),
                    count=count,
                    value=value,
                )
            )

    follow_ups_due = (
        db.scalar(
            _narrow(select(func.count()).select_from(Lead), db, current_user, scope).where(
                Lead.next_follow_up_date.is_not(None),
                Lead.next_follow_up_date <= today,
                Lead.status.not_in(CLOSED_STATUSES),
            )
        )
        or 0
    )

    won_value = next((s.value for s in stages if s.status == LeadStatus.won.value), 0.0)
    lost_value = next((s.value for s in stages if s.status == LeadStatus.lost.value), 0.0)

    return ApiResponse(
        data=LeadPipelineResponse(
            scope=scope,
            stages=stages,
            total_leads=sum(s.count for s in stages),
            total_value=sum(s.value for s in stages),
            open_value=sum(s.value for s in stages if s.status not in CLOSED_STATUSES),
            won_value=won_value,
            lost_value=lost_value,
            follow_ups_due=follow_ups_due,
        )
    )


def _load_lead(db: Session, lead_id: UUID, user: User, base: str) -> Lead:
    """Fetch a lead the caller is actually allowed to see under ``base`` scope.

    Returns 404 rather than 403 when the lead exists but sits outside the scope —
    confirming existence would leak that a competitor's record is on the books.
    """
    scope = _scope(db, user, base)
    stmt = _narrow(
        select(Lead).options(selectinload(Lead.activities)).where(Lead.id == lead_id),
        db,
        user,
        scope,
    )
    lead = db.scalars(stmt).unique().first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.get("/{lead_id}", response_model=ApiResponse[LeadDetail])
def get_lead(lead_id: UUID, db: DatabaseSession, current_user: LeadReader):
    return ApiResponse(data=_to_detail(_load_lead(db, lead_id, current_user, "leads.read")))


@router.post("", response_model=ApiResponse[LeadRead], status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: DatabaseSession, current_user: LeadCreator):
    # Only a caller who can update *other people's* leads may hand one to someone
    # else; everyone else owns what they create. This mirrors the note on
    # LeadCreate.assigned_exec_id ("execs are forced to themselves server-side").
    may_assign = _scope(db, current_user, "leads.update") in {"team", "all"}
    owner_id = payload.assigned_exec_id if (may_assign and payload.assigned_exec_id) else current_user.id
    if owner_id != current_user.id and db.get(User, owner_id) is None:
        raise HTTPException(status_code=400, detail="Assigned user does not exist")

    lead = Lead(
        company_name=payload.company_name,
        contact_person=payload.contact_person,
        contact_title=payload.contact_title,
        phone=payload.phone,
        email=payload.email,
        source=payload.source.value,
        industry=payload.industry,
        status=payload.status.value,
        estimated_value=payload.estimated_value,
        currency=payload.currency,
        next_follow_up_date=payload.next_follow_up_date,
        assigned_exec_id=owner_id,
        created_by_id=current_user.id,
    )
    db.add(lead)
    db.flush()
    db.add(
        LeadActivity(
            lead_id=lead.id,
            author_id=current_user.id,
            type="status_change",
            body=f"Lead created with status '{lead.status}'.",
        )
    )
    db.commit()
    db.refresh(lead)
    return ApiResponse(data=_to_read(lead), message="Lead created successfully")


@router.patch("/{lead_id}", response_model=ApiResponse[LeadRead])
def update_lead(
    lead_id: UUID, payload: LeadUpdate, db: DatabaseSession, current_user: LeadEditor
):
    lead = _load_lead(db, lead_id, current_user, "leads.update")
    changes = payload.model_dump(exclude_unset=True)

    if "assigned_exec_id" in changes and _scope(db, current_user, "leads.update") == "own":
        raise HTTPException(status_code=403, detail="You cannot reassign leads")
    new_owner = changes.get("assigned_exec_id")
    if new_owner and db.get(User, new_owner) is None:
        raise HTTPException(status_code=400, detail="Assigned user does not exist")

    previous_status = lead.status
    for field, value in changes.items():
        # `source`/`status` arrive as Enum members; the columns are plain strings.
        setattr(lead, field, value.value if isinstance(value, Enum) else value)

    if lead.status != previous_status:
        db.add(
            LeadActivity(
                lead_id=lead.id,
                author_id=current_user.id,
                type="status_change",
                body=f"Status moved from '{previous_status}' to '{lead.status}'.",
            )
        )

    db.commit()
    db.refresh(lead)
    return ApiResponse(data=_to_read(lead), message="Lead updated successfully")


@router.delete("/{lead_id}", response_model=ApiResponse[dict])
def delete_lead(lead_id: UUID, db: DatabaseSession, current_user: LeadDeleter):
    lead = _load_lead(db, lead_id, current_user, "leads.delete")
    db.delete(lead)
    db.commit()
    return ApiResponse(data={"deleted": True}, message="Lead deleted successfully")


@router.post(
    "/{lead_id}/activities",
    response_model=ApiResponse[LeadActivityRead],
    status_code=status.HTTP_201_CREATED,
)
def add_activity(
    lead_id: UUID, payload: LeadActivityCreate, db: DatabaseSession, current_user: LeadEditor
):
    """Log a call, note or meeting against a lead.

    Gated on the update permission family, not read: appending to the activity
    log is a write to the customer record.
    """
    lead = _load_lead(db, lead_id, current_user, "leads.update")
    activity = LeadActivity(
        lead_id=lead.id,
        author_id=current_user.id,
        type=payload.type.value,
        body=payload.body,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return ApiResponse(data=_to_activity_read(activity), message="Activity logged")
