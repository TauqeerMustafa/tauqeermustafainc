import uuid
from datetime import date, datetime
from typing import Optional

from app.schemas.common import CamelModel


class AttendanceBase(CamelModel):
    status: str
    notes: Optional[str] = None


class AttendanceCheckIn(CamelModel):
    notes: Optional[str] = None


class AttendanceCheckOut(CamelModel):
    notes: Optional[str] = None


class AttendanceUpdate(CamelModel):
    status: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    notes: Optional[str] = None


class AttendanceRead(AttendanceBase):
    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None

    # Denormalized for the admin roster so the UI doesn't need a second lookup.
    employee_name: Optional[str] = None
