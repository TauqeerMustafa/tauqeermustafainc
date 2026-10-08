import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.department import Department
from app.models.employee import Employee
from app.schemas.common import ApiResponse
from app.schemas.department import DepartmentCreate, DepartmentRead, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=ApiResponse[list[DepartmentRead]])
def list_departments(db: DatabaseSession) -> ApiResponse[list[DepartmentRead]]:
    stmt = (
        select(Department, func.count(Employee.id).label("employee_count"))
        .outerjoin(Employee, Employee.department_id == Department.id)
        .group_by(Department.id)
        .order_by(Department.name.asc())
    )
    rows = db.execute(stmt).all()
    data = [
        DepartmentRead(
            id=dept.id,
            name=dept.name,
            employee_count=count,
            created_at=dept.created_at,
            updated_at=dept.updated_at,
        )
        for dept, count in rows
    ]
    return ApiResponse(
        data=data,
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
        data=DepartmentRead(
            id=dept.id,
            name=dept.name,
            employee_count=0,
            created_at=dept.created_at,
            updated_at=dept.updated_at,
        ),
        message=f"Department '{dept.name}' created successfully",
    )


@router.patch("/{department_id}", response_model=ApiResponse[DepartmentRead])
def update_department(
    department_id: uuid.UUID,
    payload: DepartmentUpdate,
    db: DatabaseSession,
    _: CurrentAdmin,
) -> ApiResponse[DepartmentRead]:
    dept = db.get(Department, department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if payload.name is not None:
        new_name = payload.name.strip()
        existing = db.scalar(
            select(Department).where(Department.name == new_name, Department.id != department_id)
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Department '{new_name}' already exists.",
            )
        dept.name = new_name

    db.commit()
    db.refresh(dept)

    count = (
        db.scalar(select(func.count(Employee.id)).where(Employee.department_id == dept.id))
        or 0
    )

    return ApiResponse(
        data=DepartmentRead(
            id=dept.id,
            name=dept.name,
            employee_count=count,
            created_at=dept.created_at,
            updated_at=dept.updated_at,
        ),
        message=f"Department '{dept.name}' updated successfully",
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
