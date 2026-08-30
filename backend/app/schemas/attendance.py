import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AttendanceBase(BaseModel):
    status: str
    notes: Optional[str] = None

class AttendanceCheckIn(BaseModel):
    notes: Optional[str] = None

class AttendanceCheckOut(BaseModel):
    notes: Optional[str] = None

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    notes: Optional[str] = None

class AttendanceRead(AttendanceBase):
    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    
    # We can include a bit of employee info if needed
    employee_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
