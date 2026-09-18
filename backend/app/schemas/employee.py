from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from app.schemas.common import CamelModel


class EmployeeBase(CamelModel):
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
    status: Optional[str] = None
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: UUID
    user_id: UUID
    employee_id_string: Optional[str] = None

    # Flattened from the linked User row so the directory renders in one pass.
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class TaskProgress(CamelModel):
    total: int = 0
    completed: int = 0
    in_progress: int = 0
    review: int = 0
    todo: int = 0
    completion_rate: float = 0.0


class AttendanceSummary(CamelModel):
    present_days: int = 0
    late_days: int = 0
    absent_days: int = 0
    punctuality_rate: float = 0.0
    today_status: str = "absent"
    today_check_in: Optional[str] = None
    today_check_out: Optional[str] = None


class LeadSummary(CamelModel):
    total_assigned: int = 0
    contacted: int = 0
    won: int = 0


class EmployeeProgressItem(CamelModel):
    id: UUID
    user_id: UUID
    employee_id_string: Optional[str] = None
    name: str
    email: str
    role: Optional[str] = None
    job_title: Optional[str] = None
    department_name: Optional[str] = None
    status: str
    tasks: TaskProgress
    attendance: AttendanceSummary
    leads: LeadSummary
    performance_score: float


class ActivityFeedItem(CamelModel):
    id: str
    user_id: Optional[UUID] = None
    employee_id: Optional[UUID] = None
    employee_name: str
    employee_code: Optional[str] = None
    activity_type: str
    action: str
    title: str
    description: str
    timestamp: datetime
    metadata: Optional[dict] = None


class WorkforceActivityOverview(CamelModel):
    total_employees: int
    working_now: int
    tasks_completed_today: int
    overall_completion_rate: float
    overall_punctuality_rate: float
    progress_matrix: list[EmployeeProgressItem]
    recent_activities: list[ActivityFeedItem]


class EmployeeDetailActivity(CamelModel):
    employee: EmployeeResponse
    progress: EmployeeProgressItem
    recent_tasks: list[dict]
    recent_attendance: list[dict]
    activities: list[ActivityFeedItem]

