from datetime import datetime, date
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field

class ProjectTaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[date] = None
    project_id: Optional[UUID] = None
    assigned_to_id: Optional[UUID] = None

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskUpdate(BaseModel):
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

    class Config:
        from_attributes = True
