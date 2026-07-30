import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.service import Service
from app.schemas.common import ApiResponse, PaginatedResult, Pagination
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=ApiResponse[PaginatedResult[ServiceRead]])
def list_services(
    db: DatabaseSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ApiResponse[PaginatedResult[ServiceRead]]:
    stmt = select(Service).order_by(Service.created_at.asc())
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[ServiceRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.get("/{slug}", response_model=ApiResponse[ServiceRead])
def get_service(slug: str, db: DatabaseSession) -> ApiResponse[ServiceRead]:
    service = db.scalar(select(Service).where(Service.slug == slug))
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return ApiResponse(data=ServiceRead.model_validate(service))


@router.post("", response_model=ApiResponse[ServiceRead], status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[ServiceRead]:
    if db.scalar(select(Service).where(Service.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return ApiResponse(data=ServiceRead.model_validate(service), message="Service created")


@router.put("/{service_id}", response_model=ApiResponse[ServiceRead])
def update_service(
    service_id: uuid.UUID, payload: ServiceUpdate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[ServiceRead]:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != service.slug:
        if db.scalar(select(Service).where(Service.slug == updates["slug"])):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    for field, value in updates.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return ApiResponse(data=ServiceRead.model_validate(service), message="Service updated")


@router.delete("/{service_id}", response_model=ApiResponse[dict])
def delete_service(service_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    db.delete(service)
    db.commit()
    return ApiResponse(data={"id": str(service_id)}, message="Service deleted")
