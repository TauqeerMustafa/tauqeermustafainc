"""Scheduled email — a server-side send queue.

open.email has no native "send later" parameter, so delayed delivery is
implemented here: a user schedules a message, we persist it, and an external
cron POSTs :func:`dispatch_scheduled` on a fixed interval to send everything
that has come due. Delivery therefore does not depend on the sender's browser
or laptop being on.

Scoping: the sender is always resolved from the caller's own provisioned
mailbox — a client can never schedule mail "from" an address it does not own —
and list/cancel only ever touch the caller's own rows.
"""

import hmac
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DatabaseSession, is_admin
from app.core.config import settings
from app.core.logging import get_logger
from app.models.scheduled_email import ScheduledEmail
from app.schemas.common import ApiResponse
from app.schemas.scheduled_email import (
    DispatchResult,
    ScheduledEmailCreate,
    ScheduledEmailResponse,
)
from app.services.openemail import OpenEmailSendError, send_message

logger = get_logger(__name__)

router = APIRouter(prefix="/mail", tags=["mail"])

# A send that keeps failing is parked as ``failed`` after this many tries so the
# dispatcher never wedges on one poisoned row.
MAX_ATTEMPTS = 3


def _split_recipients(raw: str) -> list[str]:
    return [addr.strip() for addr in raw.split(",") if addr.strip()]


def _to_read(row: ScheduledEmail) -> ScheduledEmailResponse:
    return ScheduledEmailResponse(
        id=row.id,
        from_address=row.from_address,
        to=_split_recipients(row.to_addresses),
        subject=row.subject,
        text=row.body_text,
        html=row.body_html,
        send_at=row.send_at,
        status=row.status,
        attempts=row.attempts,
        error=row.error,
        sent_at=row.sent_at,
        created_at=row.created_at,
    )


@router.post(
    "/scheduled",
    response_model=ApiResponse[ScheduledEmailResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_scheduled(
    payload: ScheduledEmailCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ApiResponse[ScheduledEmailResponse]:
    if not (payload.text and payload.text.strip()) and not (payload.html and payload.html.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message body is required.",
        )

    # Resolve the sending mailbox. Admins have access to every org mailbox
    # (mirroring interactive send), so their selected mailbox is honored;
    # everyone else is pinned to their own provisioned mailbox so a client can
    # never schedule mail "from" an address it does not own.
    if is_admin(current_user):
        mailbox_id = payload.mailbox_id or current_user.openemail_mailbox_id
        from_address = str(payload.from_address) if payload.from_address else current_user.openemail_address
        if not mailbox_id or not from_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Select a mailbox to send from.",
            )
    else:
        mailbox_id = current_user.openemail_mailbox_id
        from_address = current_user.openemail_address
        if not mailbox_id or not from_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your account has no mailbox provisioned yet.",
            )

    # Normalize to an aware UTC instant; a naive datetime from the client is
    # assumed to already be UTC (the frontend sends an ISO string with offset).
    send_at = payload.send_at
    if send_at.tzinfo is None:
        send_at = send_at.replace(tzinfo=timezone.utc)
    if send_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="sendAt must be in the future.",
        )

    full_name = f"{current_user.first_name} {current_user.last_name}".strip()
    row = ScheduledEmail(
        user_id=current_user.id,
        mailbox_id=mailbox_id,
        from_address=from_address,
        from_name=full_name or None,
        to_addresses=",".join(str(addr) for addr in payload.to),
        subject=payload.subject or "",
        body_text=payload.text,
        body_html=payload.html,
        send_at=send_at,
        status="pending",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return ApiResponse(data=_to_read(row), message="Message scheduled")


@router.get("/scheduled", response_model=ApiResponse[list[ScheduledEmailResponse]])
def list_scheduled(
    db: DatabaseSession,
    current_user: CurrentUser,
    status_filter: str | None = Query(default=None, alias="status"),
) -> ApiResponse[list[ScheduledEmailResponse]]:
    stmt = (
        select(ScheduledEmail)
        .where(ScheduledEmail.user_id == current_user.id)
        .order_by(ScheduledEmail.send_at.desc())
    )
    if status_filter:
        stmt = stmt.where(ScheduledEmail.status == status_filter)
    rows = db.scalars(stmt).all()
    return ApiResponse(data=[_to_read(r) for r in rows])


@router.delete("/scheduled/{scheduled_id}", response_model=ApiResponse[dict])
def cancel_scheduled(
    scheduled_id: uuid.UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ApiResponse[dict]:
    row = db.get(ScheduledEmail, scheduled_id)
    # 404 rather than 403 when it isn't the caller's row: don't reveal that an
    # id belonging to someone else exists.
    if row is None or row.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if row.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot cancel a message that is already {row.status}.",
        )
    row.status = "canceled"
    db.commit()
    return ApiResponse(data={"id": str(scheduled_id)}, message="Scheduled message canceled")


@router.post("/scheduled/dispatch", response_model=ApiResponse[DispatchResult])
def dispatch_scheduled(
    db: DatabaseSession,
    x_cron_secret: str | None = Header(default=None, alias="X-Cron-Secret"),
) -> ApiResponse[DispatchResult]:
    """Send every pending message whose ``send_at`` has passed.

    Intentionally unauthenticated-by-user but guarded by a shared secret so an
    external cron can call it. When ``CRON_SECRET`` is unset the endpoint is
    disabled (503) rather than open. Each row is processed and committed
    independently so one bad recipient can't block the rest of the batch.
    """
    if not settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scheduled dispatch is disabled (CRON_SECRET not configured).",
        )
    if not x_cron_secret or not hmac.compare_digest(x_cron_secret, settings.cron_secret):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")

    now = datetime.now(timezone.utc)
    due = db.scalars(
        select(ScheduledEmail)
        .where(ScheduledEmail.status == "pending", ScheduledEmail.send_at <= now)
        .order_by(ScheduledEmail.send_at.asc())
        .limit(100)
    ).all()

    sent = 0
    failed = 0
    for row in due:
        row.attempts += 1
        try:
            result = send_message(
                row.mailbox_id,
                from_email=row.from_address,
                from_name=row.from_name,
                to=_split_recipients(row.to_addresses),
                subject=row.subject,
                text=row.body_text,
                html=row.body_html,
                save=True,
            )
            row.status = "sent"
            row.sent_at = datetime.now(timezone.utc)
            row.error = None
            delivery_id = result.get("deliveryId") if isinstance(result, dict) else None
            if delivery_id:
                row.delivery_id = str(delivery_id)
            sent += 1
        except OpenEmailSendError as exc:
            row.error = str(exc)[:1000]
            # Keep retrying on the next tick until we run out of attempts.
            if row.attempts >= MAX_ATTEMPTS:
                row.status = "failed"
                failed += 1
                logger.error("scheduled email %s failed permanently: %s", row.id, exc)
            else:
                logger.warning(
                    "scheduled email %s send failed (attempt %s/%s): %s",
                    row.id, row.attempts, MAX_ATTEMPTS, exc,
                )
        db.commit()

    return ApiResponse(
        data=DispatchResult(processed=len(due), sent=sent, failed=failed),
        message=f"Dispatched {sent} of {len(due)} due message(s)",
    )
