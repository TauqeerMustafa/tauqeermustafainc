"""Project tasks.

Reads are ``CurrentManager``: the management portal's Delivery page reports on
open and overdue work, and exec/team-lead users would 403 on an admin-only list
while the sidebar still offered them the page. Writes stay ``CurrentAdmin``.
"""

import math
import uuid
from datetime import date

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select, update

from app.api.deps import CurrentAdmin, CurrentManager, CurrentUser, DatabaseSession
from app.models.task import ProjectTask
from app.models.user import User
from app.schemas.task import (
    BulkDeletePayload,
    BulkTaskUpdatePayload,
    ProjectTaskCreate,
    ProjectTaskResponse,
    ProjectTaskUpdate,
    TaskAssigneeRead,
)
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _to_read(task: ProjectTask) -> ProjectTaskResponse:
    """Serialize one task, flattening the joined project and assignee names."""
    assignee = task.assigned_to

    assignees_list: list[TaskAssigneeRead] = []
    assignee_ids: list[uuid.UUID] = []
    if task.assignees:
        for a in task.assignees:
            assignee_ids.append(a.id)
            assignees_list.append(
                TaskAssigneeRead(
                    id=a.id,
                    first_name=a.first_name,
                    last_name=a.last_name,
                    email=a.email,
                    name=f"{a.first_name} {a.last_name}".strip(),
                )
            )
    elif assignee:
        assignee_ids.append(assignee.id)
        assignees_list.append(
            TaskAssigneeRead(
                id=assignee.id,
                first_name=assignee.first_name,
                last_name=assignee.last_name,
                email=assignee.email,
                name=f"{assignee.first_name} {assignee.last_name}".strip(),
            )
        )

    # Flatten all assignee names so assigned_to_name displays all assignees
    if assignees_list:
        assigned_to_name = ", ".join(a.name for a in assignees_list if a.name) or None
    elif assignee:
        assigned_to_name = f"{assignee.first_name} {assignee.last_name}".strip() or None
    else:
        assigned_to_name = None

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
        assigned_to_name=assigned_to_name,
        assigned_to_ids=assignee_ids,
        assignees=assignees_list,
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

    total = db.scalar(select(func.count(func.distinct(ProjectTask.id))).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).unique().all()

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
    """The signed-in user's own assigned tasks (as primary assignee or multi-assignee)."""
    stmt = (
        select(ProjectTask)
        .outerjoin(ProjectTask.assignees)
        .where(
            or_(
                ProjectTask.assigned_to_id == current_user.id,
                User.id == current_user.id,
            )
        )
        .distinct()
        .order_by(ProjectTask.created_at.desc())
    )
    rows = db.scalars(stmt).all()
    return ApiResponse(data=[_to_read(row) for row in rows])


@router.post("/bulk-delete", response_model=ApiResponse[dict])
def bulk_delete_tasks(
    payload: BulkDeletePayload, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[dict]:
    """Delete multiple tasks by their IDs."""
    result = db.execute(delete(ProjectTask).where(ProjectTask.id.in_(payload.ids)))
    db.commit()
    return ApiResponse(
        data={"deleted": result.rowcount, "ids": [str(i) for i in payload.ids]},
        message=f"{result.rowcount} tasks deleted successfully",
    )


@router.post("/bulk-update", response_model=ApiResponse[dict])
def bulk_update_tasks(
    payload: BulkTaskUpdatePayload, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[dict]:
    """Update status or priority across multiple tasks."""
    updates = {}
    if payload.status is not None:
        updates["status"] = payload.status
    if payload.priority is not None:
        updates["priority"] = payload.priority

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    stmt = (
        update(ProjectTask)
        .where(ProjectTask.id.in_(payload.ids))
        .values(**updates)
    )
    result = db.execute(stmt)
    db.commit()
    return ApiResponse(
        data={"updated": result.rowcount},
        message=f"{result.rowcount} tasks updated successfully",
    )


@router.post("", response_model=ApiResponse[ProjectTaskResponse], status_code=status.HTTP_201_CREATED)
def create_task(
    payload: ProjectTaskCreate, db: DatabaseSession, current_admin: CurrentAdmin
) -> ApiResponse[ProjectTaskResponse]:
    data = payload.model_dump()
    assigned_to_ids = data.pop("assigned_to_ids", None)
    data["created_by_id"] = current_admin.id

    if assigned_to_ids and not data.get("assigned_to_id"):
        data["assigned_to_id"] = assigned_to_ids[0]

    task = ProjectTask(**data)
    if assigned_to_ids:
        users = list(db.scalars(select(User).where(User.id.in_(assigned_to_ids))).all())
        task.assignees = users
    elif task.assigned_to_id:
        user = db.get(User, task.assigned_to_id)
        if user:
            task.assignees = [user]

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

    dump = payload.model_dump(exclude_unset=True)
    assigned_to_ids = dump.pop("assigned_to_ids", None)

    for field, value in dump.items():
        setattr(task, field, value)

    if assigned_to_ids is not None:
        if assigned_to_ids:
            users = list(db.scalars(select(User).where(User.id.in_(assigned_to_ids))).all())
            task.assignees = users
            task.assigned_to_id = assigned_to_ids[0]
        else:
            task.assignees = []
            task.assigned_to_id = None
    elif "assigned_to_id" in dump and dump["assigned_to_id"]:
        user = db.get(User, dump["assigned_to_id"])
        if user:
            task.assignees = [user]

    db.commit()
    db.refresh(task)
    return ApiResponse(data=_to_read(task), message="Task updated successfully")


@router.delete("/all/clear", response_model=ApiResponse[dict])
def clear_all_tasks(db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    """Delete all project tasks."""
    result = db.execute(delete(ProjectTask))
    db.commit()
    return ApiResponse(data={"deleted": result.rowcount}, message="All tasks deleted successfully")


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

