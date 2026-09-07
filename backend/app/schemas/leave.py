import uuid
from datetime import date, datetime
from typing import Optional

from app.schemas.common import CamelModel


class LeaveRequestCreate(CamelModel):
    start_date: date
    end_date: date
    leave_type: str
    reason: str


class LeaveRequestUpdate(CamelModel):
    status: str
    manager_notes: Optional[str] = None


class LeaveRequestRead(CamelModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    start_date: date
    end_date: date
    leave_type: str
    reason: str
    status: str
    manager_id: Optional[uuid.UUID] = None
    manager_notes: Optional[str] = None
    created_at: datetime

    employee_name: Optional[str] = None
