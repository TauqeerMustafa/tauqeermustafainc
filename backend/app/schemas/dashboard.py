"""Dashboard payloads.

These were previously untyped ``Dict[str, Any]`` bags built by hand in the
route, which meant the JSON keys stayed snake_case while the rest of the API
served camelCase. Declaring them as ``CamelModel`` puts every endpoint on one
casing convention and gives the frontend a shape it can actually type.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from app.schemas.common import CamelModel


class DashboardAttendance(CamelModel):
    status: str
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None


class DashboardTask(CamelModel):
    id: str
    title: str
    status: str


class DashboardLeave(CamelModel):
    pending_count: int = 0


class DashboardProject(CamelModel):
    id: str
    name: str
    status: str


class DashboardAnnouncement(CamelModel):
    id: str
    title: str
    published_at: Optional[datetime] = None


class DashboardDocument(CamelModel):
    id: str
    title: str
    type: str


class DashboardNotification(CamelModel):
    id: str
    title: str
    body: Optional[str] = None
    created_at: Optional[datetime] = None


class EmployeeDashboardResponse(CamelModel):
    attendance: DashboardAttendance
    tasks: list[DashboardTask] = []
    leave: DashboardLeave = DashboardLeave()
    projects: list[DashboardProject] = []
    announcements: list[DashboardAnnouncement] = []
    documents: list[DashboardDocument] = []
    notifications: list[DashboardNotification] = []


class AdminOverview(CamelModel):
    total_employees: int = 0
    present: int = 0
    on_leave: int = 0
    open_tasks: int = 0


class AttendanceToday(CamelModel):
    present: int = 0
    late: int = 0
    absent: int = 0
    on_leave: int = 0


class PendingLeaveSummary(CamelModel):
    id: str
    employee: str
    leave_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ActivityEntry(CamelModel):
    id: str
    action: str
    entity: Optional[str] = None
    created_at: Optional[datetime] = None


class AdminDashboardResponse(CamelModel):
    overview: AdminOverview
    attendance_today: AttendanceToday
    pending_leave: list[PendingLeaveSummary] = []
    recent_activity: list[ActivityEntry] = []
    tasks: list[DashboardTask] = []
    projects: list[DashboardProject] = []
    announcements: list[DashboardAnnouncement] = []
    documents: list[DashboardDocument] = []


class CountByKey(CamelModel):
    """One bar of a breakdown chart: a stable key, a display label, a count."""

    key: str
    label: str
    count: int = 0


class ManagementProject(CamelModel):
    """Delivery view of a project — richer than ``DashboardProject`` because the
    management portal reports on progress, not just existence."""

    id: str
    name: str
    status: str
    progress: int = 0
    next_milestone: Optional[str] = None


class ManagementProjectRow(ManagementProject):
    """One row of the Delivery page's full project table.

    Extends ``ManagementProject`` with the client it belongs to and its live task
    counts, so the page can show delivery load without a second round-trip.
    """

    client_name: Optional[str] = None
    summary: Optional[str] = None
    open_tasks: int = 0
    overdue_tasks: int = 0
    updated_at: Optional[datetime] = None


class ManagementOverview(CamelModel):
    headcount: int = 0
    present_today: int = 0
    on_leave_today: int = 0
    pending_approvals: int = 0
    active_projects: int = 0
    open_tasks: int = 0
    overdue_tasks: int = 0


class ManagementDashboardResponse(CamelModel):
    """Reporting read model for the management portal.

    Deliberately *not* ``AdminDashboardResponse``: that one carries the audit
    trail, which stays admin-only. Exec and team-lead users get headcount,
    attendance, the approval queue and delivery health instead.
    """

    overview: ManagementOverview
    attendance_today: AttendanceToday
    headcount_by_role: list[CountByKey] = []
    headcount_by_department: list[CountByKey] = []
    delivery: list[CountByKey] = []
    pending_leave: list[PendingLeaveSummary] = []
    tasks: list[DashboardTask] = []
    projects: list[ManagementProject] = []
