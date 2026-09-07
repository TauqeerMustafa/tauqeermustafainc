import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.career import Career
from app.schemas.career import CareerCreate, CareerRead, CareerUpdate
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("", response_model=ApiResponse[PaginatedResult[CareerRead]])
def list_careers(
    db: DatabaseSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    open_only: bool = Query(default=True),
) -> ApiResponse[PaginatedResult[CareerRead]]:
    stmt = select(Career).order_by(Career.created_at.desc())
    if open_only:
        stmt = stmt.where(Career.is_open.is_(True))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[CareerRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.get("/{slug}", response_model=ApiResponse[CareerRead])
def get_career(slug: str, db: DatabaseSession) -> ApiResponse[CareerRead]:
    job = db.scalar(select(Career).where(Career.slug == slug))
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return ApiResponse(data=CareerRead.model_validate(job))


@router.post("", response_model=ApiResponse[CareerRead], status_code=status.HTTP_201_CREATED)
def create_career(
    payload: CareerCreate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[CareerRead]:
    if db.scalar(select(Career).where(Career.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    job = Career(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return ApiResponse(data=CareerRead.model_validate(job), message="Job posting created")


@router.put("/{career_id}", response_model=ApiResponse[CareerRead])
def update_career(
    career_id: uuid.UUID, payload: CareerUpdate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[CareerRead]:
    job = db.get(Career, career_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != job.slug:
        if db.scalar(select(Career).where(Career.slug == updates["slug"])):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    for field, value in updates.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return ApiResponse(data=CareerRead.model_validate(job), message="Job posting updated")


@router.delete("/{career_id}", response_model=ApiResponse[dict])
def delete_career(career_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    job = db.get(Career, career_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    db.delete(job)
    db.commit()
    return ApiResponse(data={"id": str(career_id)}, message="Job posting deleted")
