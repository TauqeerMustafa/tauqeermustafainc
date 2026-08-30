import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class LeaveRequestCreate(BaseModel):
    start_date: date
    end_date: date
    leave_type: str
    reason: str

class LeaveRequestUpdate(BaseModel):
    status: str
    manager_notes: Optional[str] = None

class LeaveRequestRead(BaseModel):
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
    
    model_config = ConfigDict(from_attributes=True)
