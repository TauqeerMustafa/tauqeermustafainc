import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.department import Department
from app.schemas.common import ApiResponse
from app.schemas.department import DepartmentCreate, DepartmentRead

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=ApiResponse[list[DepartmentRead]])
def list_departments(db: DatabaseSession) -> ApiResponse[list[DepartmentRead]]:
    stmt = select(Department).order_by(Department.name.asc())
    rows = db.scalars(stmt).all()
    return ApiResponse(
        data=[DepartmentRead.model_validate(row) for row in rows],
        message="Departments retrieved successfully",
    )


@router.post("", response_model=ApiResponse[DepartmentRead], status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: DatabaseSession,
    _: CurrentAdmin,
) -> ApiResponse[DepartmentRead]:
    existing = db.scalar(select(Department).where(Department.name == payload.name.strip()))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Department '{payload.name}' already exists.",
        )

    dept = Department(name=payload.name.strip())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return ApiResponse(
        data=DepartmentRead.model_validate(dept),
        message=f"Department '{dept.name}' created successfully",
    )


@router.delete("/{department_id}", response_model=ApiResponse[dict])
def delete_department(
    department_id: uuid.UUID,
    db: DatabaseSession,
    _: CurrentAdmin,
) -> ApiResponse[dict]:
    dept = db.get(Department, department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )
    db.delete(dept)
    db.commit()
    return ApiResponse(
        data={"id": str(department_id)},
        message="Department deleted successfully",
    )
