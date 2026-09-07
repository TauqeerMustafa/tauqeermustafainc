import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.portfolio import Portfolio
from app.schemas.common import ApiResponse, PaginatedResult, Pagination
from app.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=ApiResponse[PaginatedResult[PortfolioRead]])
def list_portfolio(
    db: DatabaseSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ApiResponse[PaginatedResult[PortfolioRead]]:
    stmt = select(Portfolio).order_by(Portfolio.created_at.desc())
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[PortfolioRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.get("/{slug}", response_model=ApiResponse[PortfolioRead])
def get_project(slug: str, db: DatabaseSession) -> ApiResponse[PortfolioRead]:
    project = db.scalar(select(Portfolio).where(Portfolio.slug == slug))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApiResponse(data=PortfolioRead.model_validate(project))


@router.post("", response_model=ApiResponse[PortfolioRead], status_code=status.HTTP_201_CREATED)
def create_project(
    payload: PortfolioCreate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[PortfolioRead]:
    if db.scalar(select(Portfolio).where(Portfolio.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    project = Portfolio(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return ApiResponse(data=PortfolioRead.model_validate(project), message="Project created")


@router.put("/{project_id}", response_model=ApiResponse[PortfolioRead])
def update_project(
    project_id: uuid.UUID, payload: PortfolioUpdate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[PortfolioRead]:
    project = db.get(Portfolio, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != project.slug:
        if db.scalar(select(Portfolio).where(Portfolio.slug == updates["slug"])):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return ApiResponse(data=PortfolioRead.model_validate(project), message="Project updated")


@router.delete("/{project_id}", response_model=ApiResponse[dict])
def delete_project(project_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    project = db.get(Portfolio, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
    return ApiResponse(data={"id": str(project_id)}, message="Project deleted")
