import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=ApiResponse[PaginatedResult[AnnouncementRead]])
def list_announcements(
    db: DatabaseSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    published_only: bool = Query(default=False),
) -> ApiResponse[PaginatedResult[AnnouncementRead]]:
    stmt = select(Announcement).order_by(Announcement.created_at.desc())
    if published_only:
        stmt = stmt.where(Announcement.is_published.is_(True))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[AnnouncementRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.post("", response_model=ApiResponse[AnnouncementRead], status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[AnnouncementRead]:
    announcement = Announcement(**payload.model_dump())
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return ApiResponse(data=AnnouncementRead.model_validate(announcement), message="Announcement created")


@router.put("/{announcement_id}", response_model=ApiResponse[AnnouncementRead])
def update_announcement(
    announcement_id: uuid.UUID,
    payload: AnnouncementUpdate,
    db: DatabaseSession,
    _: CurrentAdmin,
) -> ApiResponse[AnnouncementRead]:
    announcement = db.get(Announcement, announcement_id)
    if announcement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(announcement, field, value)

    db.commit()
    db.refresh(announcement)
    return ApiResponse(data=AnnouncementRead.model_validate(announcement), message="Announcement updated")


@router.delete("/{announcement_id}", response_model=ApiResponse[dict])
def delete_announcement(
    announcement_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[dict]:
    announcement = db.get(Announcement, announcement_id)
    if announcement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    db.delete(announcement)
    db.commit()
    return ApiResponse(data={"id": str(announcement_id)}, message="Announcement deleted")
