import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.task import ProjectTask
from app.schemas.task import ProjectTaskCreate, ProjectTaskUpdate, ProjectTaskResponse
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=ApiResponse[PaginatedResult[ProjectTaskResponse]])
def list_tasks(
    db: DatabaseSession,
    _: CurrentAdmin,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    project_id: uuid.UUID = Query(None),
    assigned_to_id: uuid.UUID = Query(None),
    status: str = Query(None),
) -> ApiResponse[PaginatedResult[ProjectTaskResponse]]:
    stmt = select(ProjectTask).order_by(ProjectTask.created_at.desc())
    
    if project_id:
        stmt = stmt.where(ProjectTask.project_id == project_id)
    if assigned_to_id:
        stmt = stmt.where(ProjectTask.assigned_to_id == assigned_to_id)
    if status:
        stmt = stmt.where(ProjectTask.status == status)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[ProjectTaskResponse.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )

@router.post("", response_model=ApiResponse[ProjectTaskResponse], status_code=status.HTTP_201_CREATED)
def create_task(
    payload: ProjectTaskCreate, db: DatabaseSession, current_admin: CurrentAdmin
) -> ApiResponse[ProjectTaskResponse]:
    data = payload.model_dump()
    data["created_by_id"] = current_admin.id
    task = ProjectTask(**data)
    db.add(task)
    db.commit()
    db.refresh(task)
    return ApiResponse(data=ProjectTaskResponse.model_validate(task), message="Task created successfully")

@router.put("/{task_id}", response_model=ApiResponse[ProjectTaskResponse])
def update_task(
    task_id: uuid.UUID,
    payload: ProjectTaskUpdate,
    db: DatabaseSession,
    _: CurrentAdmin,
) -> ApiResponse[ProjectTaskResponse]:
    task = db.get(ProjectTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return ApiResponse(data=ProjectTaskResponse.model_validate(task), message="Task updated successfully")

@router.delete("/{task_id}", response_model=ApiResponse[dict])
def delete_task(
    task_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[dict]:
    task = db.get(ProjectTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return ApiResponse(data={"id": str(task_id)}, message="Task deleted successfully")
