from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class EmployeeBase(BaseModel):
    job_title: Optional[str] = None
    department_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    joining_date: Optional[date] = None
    status: str = Field(default="active")
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    first_name: str
    last_name: str
    email: str
    password: str
    role_id: Optional[UUID] = None
    employee_id_string: Optional[str] = None

class EmployeeUpdate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: UUID
    user_id: UUID
    employee_id_string: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
