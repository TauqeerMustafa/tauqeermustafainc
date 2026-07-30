import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.contact_message import ContactMessage
from app.schemas.common import ApiResponse, PaginatedResult, Pagination
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactCreate, db: DatabaseSession) -> ApiResponse[dict]:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return ApiResponse(
        data={"requestId": str(message.id)},
        message="Thanks for reaching out — we'll be in touch within one business day.",
    )


@router.get("", response_model=ApiResponse[PaginatedResult[ContactRead]])
def list_messages(
    db: DatabaseSession,
    _: CurrentAdmin,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    unread_only: bool = Query(default=False),
) -> ApiResponse[PaginatedResult[ContactRead]]:
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    if unread_only:
        stmt = stmt.where(ContactMessage.is_read.is_(False))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[ContactRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.put("/{message_id}", response_model=ApiResponse[ContactRead])
def update_message(
    message_id: uuid.UUID, payload: ContactUpdate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[ContactRead]:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    message.is_read = payload.is_read
    db.commit()
    db.refresh(message)
    return ApiResponse(data=ContactRead.model_validate(message), message="Message updated")


@router.delete("/{message_id}", response_model=ApiResponse[dict])
def delete_message(message_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    db.delete(message)
    db.commit()
    return ApiResponse(data={"id": str(message_id)}, message="Message deleted")
