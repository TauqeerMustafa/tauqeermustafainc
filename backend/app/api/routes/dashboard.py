from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlalchemy import case, func, select

from app.api.deps import CurrentAdmin, CurrentManager, CurrentUser, DatabaseSession
from app.models.announcement import Announcement
from app.models.attendance import Attendance
from app.models.audit_log import AuditLog
from app.models.department import Department
from app.models.document import Document
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.portal import ClientProject
from app.models.role import Role
from app.models.task import ProjectTask
from app.models.user import User
from app.schemas.dashboard import (
    ActivityEntry,
    AdminDashboardResponse,
    AdminOverview,
    AttendanceToday,
    CountByKey,
    DashboardAnnouncement,
    DashboardAttendance,
    DashboardDocument,
    DashboardLeave,
    DashboardProject,
    DashboardTask,
    EmployeeDashboardResponse,
    ManagementDashboardResponse,
    ManagementOverview,
    ManagementProject,
    ManagementProjectRow,
    PendingLeaveSummary,
)

router = APIRouter(tags=["dashboard"])


def get_current_employee(db: DatabaseSession, user_id: UUID) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(
            status_code=403, detail="Current user is not mapped to an employee profile"
        )
    return employee


def _employee_display_name(record: LeaveRequest) -> str:
    user = record.employee.user if record.employee else None
    if not user:
        return "Unknown"
    return f"{user.first_name} {user.last_name}".strip() or user.email


@router.get("/employee", response_model=EmployeeDashboardResponse)
def get_employee_dashboard(db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    today = datetime.now(timezone.utc).date()

    attendance_record = db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee.id, Attendance.date == today
        )
    )

    tasks = db.scalars(
        select(ProjectTask)
        .where(ProjectTask.assigned_to_id == current_user.id)
        .order_by(ProjectTask.due_date)
        .limit(5)
    ).all()

    pending_leave_count = (
        db.scalar(
            select(func.count())
            .select_from(LeaveRequest)
            .where(
                LeaveRequest.employee_id == employee.id,
                LeaveRequest.status == "pending",
            )
        )
        or 0
    )

    projects = db.scalars(
        select(ClientProject).order_by(ClientProject.updated_at.desc()).limit(3)
    ).all()

    announcements = db.scalars(
        select(Announcement)
        .where(Announcement.is_published.is_(True))
        .order_by(Announcement.created_at.desc())
        .limit(4)
    ).all()

    documents = db.scalars(
        select(Document)
        .where((Document.employee_id == employee.id) | (Document.employee_id.is_(None)))
        .order_by(Document.created_at.desc())
        .limit(3)
    ).all()

    return EmployeeDashboardResponse(
        attendance=DashboardAttendance(
            status=attendance_record.status if attendance_record else "absent",
            check_in_time=attendance_record.check_in_time if attendance_record else None,
            check_out_time=attendance_record.check_out_time if attendance_record else None,
        ),
        tasks=[
            DashboardTask(id=str(t.id), title=t.title, status=t.status) for t in tasks
        ],
        leave=DashboardLeave(pending_count=pending_leave_count),
        projects=[
            DashboardProject(id=str(p.id), name=p.name, status=p.status) for p in projects
        ],
        announcements=[
            DashboardAnnouncement(id=str(a.id), title=a.title, published_at=a.created_at)
            for a in announcements
        ],
        documents=[
            DashboardDocument(id=str(d.id), title=d.title, type=d.document_type)
            for d in documents
        ],
        notifications=[],
    )
@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(db: DatabaseSession, current_admin: CurrentAdmin):
    today = datetime.now(timezone.utc).date()

    # Employee has a `status` column, not `is_active` — the previous version
    # filtered on a non-existent attribute and 500'd on every request.
    total_employees = (
        db.scalar(
            select(func.count()).select_from(Employee).where(Employee.status == "active")
        )
        or 0
    )

    attendance_stats = db.execute(
        select(
            func.count(case((Attendance.status == "present", 1))),
            func.count(case((Attendance.status == "late", 1))),
            func.count(case((Attendance.status == "absent", 1))),
        ).where(Attendance.date == today)
    ).fetchone()

    present_count, late_count, absent_count = (
        attendance_stats if attendance_stats else (0, 0, 0)
    )

    leave_count = (
        db.scalar(
            select(func.count())
            .select_from(LeaveRequest)
            .where(
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today,
                LeaveRequest.status == "approved",
            )
        )
        or 0
    )
    open_tasks = (
        db.scalar(
            select(func.count()).select_from(ProjectTask).where(ProjectTask.status != "done")
        )
        or 0
    )

    pending_leaves = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.status == "pending")
        .order_by(LeaveRequest.created_at.desc())
        .limit(5)
    ).all()

    # AuditLog's timestamp column is `timestamp`, and the entity field is
    # `entity_type` — the old code ordered by `created_at` and read
    # `entity_name`, neither of which exist on the model.
    activities = db.scalars(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(6)
    ).all()

    tasks = db.scalars(
        select(ProjectTask)
        .where(ProjectTask.status != "done")
        .order_by(ProjectTask.due_date)
        .limit(5)
    ).all()
    projects = db.scalars(
        select(ClientProject).order_by(ClientProject.updated_at.desc()).limit(5)
    ).all()
    announcements = db.scalars(
        select(Announcement).order_by(Announcement.created_at.desc()).limit(4)
    ).all()
    documents = db.scalars(
        select(Document).order_by(Document.created_at.desc()).limit(5)
    ).all()

    return AdminDashboardResponse(
        overview=AdminOverview(
            total_employees=total_employees,
            present=present_count,
            on_leave=leave_count,
            open_tasks=open_tasks,
        ),
        attendance_today=AttendanceToday(
            present=present_count,
            late=late_count,
            absent=absent_count,
            on_leave=leave_count,
        ),
        pending_leave=[
            PendingLeaveSummary(
                id=str(record.id),
                employee=_employee_display_name(record),
                leave_type=record.leave_type,
                start_date=record.start_date.isoformat(),
                end_date=record.end_date.isoformat(),
            )
            for record in pending_leaves
        ],
        recent_activity=[
            ActivityEntry(
                id=str(a.id),
                action=a.action,
                entity=a.entity_type,
                created_at=a.timestamp,
            )
            for a in activities
        ],
        tasks=[DashboardTask(id=str(t.id), title=t.title, status=t.status) for t in tasks],
        projects=[
            DashboardProject(id=str(p.id), name=p.name, status=p.status) for p in projects
        ],
        announcements=[
            DashboardAnnouncement(id=str(a.id), title=a.title, published_at=a.created_at)
            for a in announcements
        ],
        documents=[
            DashboardDocument(id=str(d.id), title=d.title, type=d.document_type)
            for d in documents
        ],
    )


@router.get("/management", response_model=ManagementDashboardResponse)
def get_management_dashboard(db: DatabaseSession, current_manager: CurrentManager):
    """Reporting surface for the management portal.

    ``/dashboard/admin`` is ``CurrentAdmin`` because it exposes the audit trail,
    so exec and team-lead users — who *are* the management portal's audience per
    ``PORTAL_ACCESS`` — would 403 on it. This endpoint serves the same shape of
    question from ``CurrentManager``-safe data only.
    """
    today = datetime.now(timezone.utc).date()

    headcount = (
        db.scalar(select(func.count()).select_from(Employee).where(Employee.status == "active"))
        or 0
    )

    attendance_stats = db.execute(
        select(
            func.count(case((Attendance.status == "present", 1))),
            func.count(case((Attendance.status == "late", 1))),
            func.count(case((Attendance.status == "absent", 1))),
        ).where(Attendance.date == today)
    ).fetchone()
    present_count, late_count, absent_count = attendance_stats or (0, 0, 0)

    on_leave_today = (
        db.scalar(
            select(func.count())
            .select_from(LeaveRequest)
            .where(
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today,
                LeaveRequest.status == "approved",
            )
        )
        or 0
    )
    pending_approvals = (
        db.scalar(
            select(func.count()).select_from(LeaveRequest).where(LeaveRequest.status == "pending")
        )
        or 0
    )
    open_tasks = (
        db.scalar(
            select(func.count()).select_from(ProjectTask).where(ProjectTask.status != "done")
        )
        or 0
    )
    # A task with no due date can never be late, so NULL must be excluded
    # explicitly — SQL comparisons against NULL are unknown, not false.
    overdue_tasks = (
        db.scalar(
            select(func.count())
            .select_from(ProjectTask)
            .where(
                ProjectTask.status != "done",
                ProjectTask.due_date.is_not(None),
                ProjectTask.due_date < today,
            )
        )
        or 0
    )
    active_projects = (
        db.scalar(
            select(func.count())
            .select_from(ClientProject)
            .where(ClientProject.status.not_in(("completed", "cancelled", "archived")))
        )
        or 0
    )

    # Headcount splits. Employees with no role or no department still need a
    # bucket, otherwise the bars silently under-count the headcount above.
    role_rows = db.execute(
        select(Role.slug, Role.name, func.count(Employee.id))
        .select_from(Employee)
        .join(User, User.id == Employee.user_id)
        .outerjoin(Role, Role.id == User.role_id)
        .where(Employee.status == "active")
        .group_by(Role.slug, Role.name)
        .order_by(func.count(Employee.id).desc())
    ).all()
    headcount_by_role = [
        CountByKey(key=slug or "unassigned", label=name or "Unassigned", count=count)
        for slug, name, count in role_rows
    ]

    department_rows = db.execute(
        select(Department.name, func.count(Employee.id))
        .select_from(Employee)
        .outerjoin(Department, Department.id == Employee.department_id)
        .where(Employee.status == "active")
        .group_by(Department.name)
        .order_by(func.count(Employee.id).desc())
    ).all()
    headcount_by_department = [
        CountByKey(key=name or "unassigned", label=name or "Unassigned", count=count)
        for name, count in department_rows
    ]

    delivery_rows = db.execute(
        select(ClientProject.status, func.count(ClientProject.id))
        .group_by(ClientProject.status)
        .order_by(func.count(ClientProject.id).desc())
    ).all()
    delivery = [
        CountByKey(key=status, label=status.replace("_", " ").title(), count=count)
        for status, count in delivery_rows
    ]

    pending_leave = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.status == "pending")
        .order_by(LeaveRequest.created_at.desc())
        .limit(6)
    ).all()

    tasks = db.scalars(
        select(ProjectTask)
        .where(ProjectTask.status != "done")
        .order_by(ProjectTask.due_date)
        .limit(6)
    ).all()

    projects = db.scalars(
        select(ClientProject).order_by(ClientProject.updated_at.desc()).limit(6)
    ).all()

    return ManagementDashboardResponse(
        overview=ManagementOverview(
            headcount=headcount,
            present_today=present_count,
            on_leave_today=on_leave_today,
            pending_approvals=pending_approvals,
            active_projects=active_projects,
            open_tasks=open_tasks,
            overdue_tasks=overdue_tasks,
        ),
        attendance_today=AttendanceToday(
            present=present_count,
            late=late_count,
            absent=absent_count,
            on_leave=on_leave_today,
        ),
        headcount_by_role=headcount_by_role,
        headcount_by_department=headcount_by_department,
        delivery=delivery,
        pending_leave=[
            PendingLeaveSummary(
                id=str(record.id),
                employee=_employee_display_name(record),
                leave_type=record.leave_type,
                start_date=record.start_date.isoformat(),
                end_date=record.end_date.isoformat(),
            )
            for record in pending_leave
        ],
        tasks=[DashboardTask(id=str(t.id), title=t.title, status=t.status) for t in tasks],
        projects=[
            ManagementProject(
                id=str(p.id),
                name=p.name,
                status=p.status,
                progress=p.progress,
                next_milestone=p.next_milestone,
            )
            for p in projects
        ],
    )


@router.get("/projects", response_model=list[ManagementProjectRow])
def get_management_projects(db: DatabaseSession, current_manager: CurrentManager):
    """Full delivery table for the management portal's Delivery page.

    The management *dashboard* caps projects at six for its summary card; this
    returns the whole book with live open/overdue task counts folded in, so the
    Delivery page can rank by load without a task fetch per row.

    Counts are computed with two grouped aggregates rather than a correlated
    subquery per project, so the endpoint stays O(1) queries regardless of how
    many projects exist.
    """
    today = datetime.now(timezone.utc).date()

    projects = db.scalars(
        select(ClientProject).order_by(ClientProject.updated_at.desc())
    ).all()

    # Client display names in one pass — a project with a deleted client still
    # renders, it just has no name to show.
    client_ids = {p.client_id for p in projects}
    name_by_id: dict[UUID, str] = {}
    if client_ids:
        for user in db.scalars(select(User).where(User.id.in_(client_ids))).all():
            name_by_id[user.id] = f"{user.first_name} {user.last_name}".strip() or user.email

    open_counts = dict(
        db.execute(
            select(ProjectTask.project_id, func.count())
            .where(ProjectTask.status != "done", ProjectTask.project_id.is_not(None))
            .group_by(ProjectTask.project_id)
        ).all()
    )
    overdue_counts = dict(
        db.execute(
            select(ProjectTask.project_id, func.count())
            .where(
                ProjectTask.status != "done",
                ProjectTask.project_id.is_not(None),
                ProjectTask.due_date.is_not(None),
                ProjectTask.due_date < today,
            )
            .group_by(ProjectTask.project_id)
        ).all()
    )

    return [
        ManagementProjectRow(
            id=str(p.id),
            name=p.name,
            status=p.status,
            progress=p.progress,
            next_milestone=p.next_milestone,
            summary=p.summary,
            client_name=name_by_id.get(p.client_id),
            open_tasks=open_counts.get(p.id, 0),
            overdue_tasks=overdue_counts.get(p.id, 0),
            updated_at=p.updated_at,
        )
        for p in projects
    ]
