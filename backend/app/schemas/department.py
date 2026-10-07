import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class DepartmentBase(CamelModel):
    name: str = Field(min_length=1, max_length=160)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
