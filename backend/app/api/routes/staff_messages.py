import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentManager, CurrentUser, DatabaseSession
from app.models.employee import Employee
from app.models.staff_message import StaffMessage
from app.models.user import User
from app.schemas.staff_message import (
    StaffMessageCreate,
    StaffMessageRead,
    StaffMessageReply,
    StaffThread,
    StaffUnreadCount,
)

staff_chat_router = APIRouter(prefix="/staff-messages", tags=["staff-messages"])
admin_staff_router = APIRouter(prefix="/admin/staff-messages", tags=["admin-staff-messages"])


def _display_name(user: User | None) -> str:
    if user is None:
        return "Leadership Desk"
    name = f"{user.first_name} {user.last_name}".strip()
    return name or user.email


def _to_message_read(msg: StaffMessage) -> StaffMessageRead:
    return StaffMessageRead(
        id=msg.id,
        user_id=msg.user_id,
        author_id=msg.author_id,
        author_name=_display_name(msg.author),
        author_email=msg.author.email if msg.author else None,
        is_from_staff=msg.author_id == msg.user_id,
        channel=msg.channel,
        body=msg.body,
        is_urgent=msg.is_urgent,
        attachment_name=msg.attachment_name,
        attachment_size=msg.attachment_size,
        attachment_url=msg.attachment_url,
        read_at=msg.read_at,
        created_at=msg.created_at,
    )


# ---------------------------------------------------------------------------
# Employee / Staff endpoints (accessible by any logged-in staff member)
# ---------------------------------------------------------------------------


@staff_chat_router.get("/my-thread", response_model=List[StaffMessageRead])
def get_my_staff_thread(
    current_user: CurrentUser,
    db: DatabaseSession,
    channel: Optional[str] = Query(None, description="Filter by desk/channel id"),
) -> List[StaffMessageRead]:
    """Retrieve the signed-in staff member's direct chat messages."""
    query = select(StaffMessage).where(StaffMessage.user_id == current_user.id)
    if channel:
        query = query.where(StaffMessage.channel == channel)
    query = query.order_by(StaffMessage.created_at.asc())

    messages = list(db.scalars(query).all())

    # Mark incoming leadership replies as read by the employee
    now = datetime.now(timezone.utc)
    updated = False
    for msg in messages:
        if msg.author_id != current_user.id and msg.read_at is None:
            msg.read_at = now
            updated = True

    if updated:
        db.commit()

    return [_to_message_read(m) for m in messages]


@staff_chat_router.post(
    "/my-thread", response_model=StaffMessageRead, status_code=status.HTTP_201_CREATED
)
def send_staff_message(
    payload: StaffMessageCreate,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> StaffMessageRead:
    """Send an internal direct message from a staff member to a leadership desk."""
    clean_body = payload.body.strip()
    if not clean_body and not payload.attachment_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message must contain text or an attached document.",
        )

    msg = StaffMessage(
        user_id=current_user.id,
        author_id=current_user.id,
        channel=payload.channel or "admin-hr",
        body=clean_body,
        is_urgent=payload.is_urgent,
        attachment_name=payload.attachment_name,
        attachment_size=payload.attachment_size,
        attachment_url=payload.attachment_url,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _to_message_read(msg)


# ---------------------------------------------------------------------------
# Admin / Management Box endpoints (manager gated: admin, exec, team lead)
# ---------------------------------------------------------------------------


@admin_staff_router.get("/threads", response_model=List[StaffThread])
def list_staff_threads(
    current_manager: CurrentManager,
    db: DatabaseSession,
    channel: Optional[str] = Query(None, description="Filter by desk/channel"),
    urgent_only: bool = Query(False, description="Filter threads with urgent messages"),
    unread_only: bool = Query(False, description="Filter threads awaiting a team reply"),
) -> List[StaffThread]:
    """List all staff conversation threads, sorted with pending/urgent replies first."""
    # Find all users who have exchanged messages
    user_ids_query = select(StaffMessage.user_id).distinct()
    if channel:
        user_ids_query = user_ids_query.where(StaffMessage.channel == channel)
    user_ids = list(db.scalars(user_ids_query).all())
    if not user_ids:
        return []

    users = list(db.scalars(select(User).where(User.id.in_(user_ids))).all())
    user_map = {u.id: u for u in users}

    employees = list(db.scalars(select(Employee).where(Employee.user_id.in_(user_ids))).all())
    emp_map = {e.user_id: e for e in employees}

    # Fetch all messages for these threads
    msg_query = (
        select(StaffMessage)
        .where(StaffMessage.user_id.in_(user_ids))
        .order_by(StaffMessage.created_at.asc())
    )
    all_messages = list(db.scalars(msg_query).all())

    by_user: dict[uuid.UUID, list[StaffMessage]] = {uid: [] for uid in user_ids}
    for m in all_messages:
        by_user[m.user_id].append(m)

    threads: List[StaffThread] = []
    for uid in user_ids:
        msgs = by_user.get(uid, [])
        if not msgs:
            continue

        u = user_map.get(uid)
        if not u:
            continue

        emp = emp_map.get(uid)
        dept_name = emp.department.name if emp and emp.department else None
        job_title = emp.job_title if emp else None

        # Compute awaiting reply: trailing employee messages with no team reply after them
        awaiting = 0
        for m in reversed(msgs):
            if m.author_id != uid:
                break
            awaiting += 1

        has_urgent = any(m.is_urgent and m.read_at is None for m in msgs)
        channels = list({m.channel for m in msgs if m.channel})
        last_msg = msgs[-1] if msgs else None

        if urgent_only and not has_urgent:
            continue
        if unread_only and awaiting == 0:
            continue

        threads.append(
            StaffThread(
                user_id=uid,
                employee_name=_display_name(u),
                employee_email=u.email,
                job_title=job_title,
                department_name=dept_name,
                last_message_at=last_msg.created_at if last_msg else None,
                last_message_preview=(
                    (last_msg.body[:120] + "...")
                    if last_msg and len(last_msg.body) > 120
                    else (last_msg.body if last_msg else None)
                ),
                awaiting_reply=awaiting,
                has_urgent=has_urgent,
                channels=channels,
                messages=[_to_message_read(m) for m in msgs],
            )
        )

    # Sort threads: awaiting reply first, then urgent, then most recent activity
    threads.sort(
        key=lambda t: (
            -t.awaiting_reply,
            -(1 if t.has_urgent else 0),
            -(t.last_message_at.timestamp() if t.last_message_at else 0),
        )
    )

    return threads


@admin_staff_router.get("/threads/{user_id}", response_model=StaffThread)
def get_staff_thread(
    user_id: uuid.UUID,
    current_manager: CurrentManager,
    db: DatabaseSession,
) -> StaffThread:
    """Fetch an employee thread and automatically mark inbound staff messages as read."""
    target_user = db.get(User, user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    emp = db.scalar(select(Employee).where(Employee.user_id == user_id))
    dept_name = emp.department.name if emp and emp.department else None
    job_title = emp.job_title if emp else None

    msgs = list(
        db.scalars(
            select(StaffMessage)
            .where(StaffMessage.user_id == user_id)
            .order_by(StaffMessage.created_at.asc())
        ).all()
    )

    # Mark inbound staff messages as read
    now = datetime.now(timezone.utc)
    updated = False
    for m in msgs:
        if m.author_id == user_id and m.read_at is None:
            m.read_at = now
            updated = True

    if updated:
        db.commit()

    awaiting = 0
    for m in reversed(msgs):
        if m.author_id != user_id:
            break
        awaiting += 1

    has_urgent = any(m.is_urgent and m.read_at is None for m in msgs)
    channels = list({m.channel for m in msgs if m.channel})
    last_msg = msgs[-1] if msgs else None

    return StaffThread(
        user_id=user_id,
        employee_name=_display_name(target_user),
        employee_email=target_user.email,
        job_title=job_title,
        department_name=dept_name,
        last_message_at=last_msg.created_at if last_msg else None,
        last_message_preview=last_msg.body if last_msg else None,
        awaiting_reply=awaiting,
        has_urgent=has_urgent,
        channels=channels,
        messages=[_to_message_read(m) for m in msgs],
    )


@admin_staff_router.post(
    "/threads/{user_id}/reply",
    response_model=StaffMessageRead,
    status_code=status.HTTP_201_CREATED,
)
def reply_to_staff(
    user_id: uuid.UUID,
    payload: StaffMessageReply,
    current_manager: CurrentManager,
    db: DatabaseSession,
) -> StaffMessageRead:
    """Send an answer from leadership back to the staff member."""
    target_user = db.get(User, user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    clean_body = payload.body.strip()
    if not clean_body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Reply cannot be empty."
        )

    msg = StaffMessage(
        user_id=user_id,
        author_id=current_manager.id,
        channel=payload.channel or "admin-hr",
        body=clean_body,
        is_urgent=payload.is_urgent,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _to_message_read(msg)


@admin_staff_router.get("/unread-count", response_model=StaffUnreadCount)
def get_staff_unread_count(
    current_manager: CurrentManager,
    db: DatabaseSession,
) -> StaffUnreadCount:
    """Return count of unread staff messages across all threads for badge counters."""
    count = (
        db.scalar(
            select(func.count(StaffMessage.id)).where(
                StaffMessage.author_id == StaffMessage.user_id,
                StaffMessage.read_at.is_(None),
            )
        )
        or 0
    )
    return StaffUnreadCount(unread_count=count)
