import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class DepartmentBase(CamelModel):
    name: str = Field(min_length=1, max_length=160)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)


class DepartmentRead(DepartmentBase):
    id: uuid.UUID
    employee_count: int = 0
    created_at: datetime
    updated_at: datetime
