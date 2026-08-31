"""Project tasks.

Reads are ``CurrentManager``: the management portal's Delivery page reports on
open and overdue work, and exec/team-lead users would 403 on an admin-only list
while the sidebar still offered them the page. Writes stay ``CurrentAdmin``.
"""

import math
import uuid
from datetime import date

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select

from app.api.deps import CurrentAdmin, CurrentManager, CurrentUser, DatabaseSession
from app.models.task import ProjectTask
from app.schemas.task import ProjectTaskCreate, ProjectTaskUpdate, ProjectTaskResponse
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _to_read(task: ProjectTask) -> ProjectTaskResponse:
    """Serialize one task, flattening the joined project and assignee names.

    Both relationships are ``lazy="joined"`` on the model, so this costs no extra
    query — but the names have to be lifted explicitly because the schema is flat.
    """
    assignee = task.assigned_to
    return ProjectTaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        project_id=task.project_id,
        assigned_to_id=task.assigned_to_id,
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        project_name=task.project.name if task.project else None,
        assigned_to_name=(
            f"{assignee.first_name} {assignee.last_name}".strip() if assignee else None
        ),
    )


@router.get("", response_model=ApiResponse[PaginatedResult[ProjectTaskResponse]])
def list_tasks(
    db: DatabaseSession,
    _: CurrentManager,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100, alias="pageSize"),
    project_id: uuid.UUID = Query(None, alias="projectId"),
    assigned_to_id: uuid.UUID = Query(None, alias="assignedToId"),
    status: str = Query(None),
    overdue: bool = Query(False),
) -> ApiResponse[PaginatedResult[ProjectTaskResponse]]:
    stmt = select(ProjectTask).order_by(ProjectTask.created_at.desc())

    if project_id:
        stmt = stmt.where(ProjectTask.project_id == project_id)
    if assigned_to_id:
        stmt = stmt.where(ProjectTask.assigned_to_id == assigned_to_id)
    if status:
        stmt = stmt.where(ProjectTask.status == status)
    if overdue:
        # A task with no due date can never be late, and NULL comparisons are
        # unknown rather than false, so the NULL check has to be explicit.
        stmt = stmt.where(
            ProjectTask.status != "done",
            ProjectTask.due_date.is_not(None),
            ProjectTask.due_date < date.today(),
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[_to_read(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.get("/me", response_model=ApiResponse[list[ProjectTaskResponse]])
def list_my_tasks(
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ApiResponse[list[ProjectTaskResponse]]:
    """The signed-in user's own assigned tasks.

    ``GET /tasks`` is ``CurrentManager``, so a regular member's task board cannot
    read it. This returns only the caller's tasks and is open to any
    authenticated user — the employee portal board reads from here. Declared
    before the ``/{task_id}`` write routes so ``/me`` is never parsed as an id.
    """
    rows = db.scalars(
        select(ProjectTask)
        .where(ProjectTask.assigned_to_id == current_user.id)
        .order_by(ProjectTask.created_at.desc())
    ).all()
    return ApiResponse(data=[_to_read(row) for row in rows])


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
    return ApiResponse(data=_to_read(task), message="Task created successfully")


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
    return ApiResponse(data=_to_read(task), message="Task updated successfully")


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
