"""Project task payloads.

These used to extend plain ``BaseModel``, so ``/tasks`` served ``due_date`` and
``project_id`` while every other router served camelCase. They now extend
``CamelModel`` like the rest of the API; ``populate_by_name=True`` means writes
still accept the snake_case field names as well as the camelCase aliases.
"""

from datetime import datetime, date
from uuid import UUID
from typing import Optional

from pydantic import Field

from app.schemas.common import CamelModel


class ProjectTaskBase(CamelModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[date] = None
    project_id: Optional[UUID] = None
    assigned_to_id: Optional[UUID] = None


class ProjectTaskCreate(ProjectTaskBase):
    pass


class ProjectTaskUpdate(CamelModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    project_id: Optional[UUID] = None
    assigned_to_id: Optional[UUID] = None


class ProjectTaskResponse(ProjectTaskBase):
    id: UUID
    created_by_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    # Flattened from the relationships so a board does not have to fetch the
    # project and assignee rows separately just to label a card.
    project_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
