from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select, case

from app.api.deps import CurrentUser, DatabaseSession, CurrentAdmin
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.models.task import ProjectTask
from app.models.portal import ClientProject
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.schemas.dashboard import EmployeeDashboardResponse, AdminDashboardResponse

router = APIRouter(tags=["dashboard"])

def get_current_employee(db: DatabaseSession, user_id: UUID) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=403, detail="Current user is not mapped to an employee profile")
    return employee

@router.get("/employee", response_model=EmployeeDashboardResponse)
def get_employee_dashboard(db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    today = datetime.now(timezone.utc).date()
    
    # Attendance
    attendance_record = db.scalar(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    
    # Tasks
    tasks = db.scalars(select(ProjectTask).where(ProjectTask.assigned_to_id == current_user.id).order_by(ProjectTask.due_date).limit(5)).all()
    
    # Leave
    pending_leave_count = db.scalar(select(func.count()).select_from(LeaveRequest).where(LeaveRequest.employee_id == employee.id, LeaveRequest.status == "pending")) or 0
    
    # Projects (mock logic: assigned to projects they have tasks in, or just all active for now)
    projects = db.scalars(select(ClientProject).limit(3)).all()
    
    # Announcements (placeholder for upcoming model)
    announcements = []
    
    # Documents
    documents = db.scalars(
        select(Document).where((Document.employee_id == employee.id) | (Document.employee_id == None))
        .order_by(Document.created_at.desc()).limit(3)
    ).all()
    
    return EmployeeDashboardResponse(
        attendance={
            "status": attendance_record.status if attendance_record else "absent",
            "check_in_time": attendance_record.check_in_time if attendance_record else None,
            "check_out_time": attendance_record.check_out_time if attendance_record else None,
        },
        tasks=[{"id": str(t.id), "title": t.title, "status": t.status} for t in tasks],
        leave={"pending_count": pending_leave_count},
        projects=[{"id": str(p.id), "name": p.name, "status": p.status} for p in projects],
        announcements=announcements,
        documents=[{"id": str(d.id), "title": d.title, "type": d.document_type} for d in documents],
        notifications=[]
    )


@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(db: DatabaseSession, current_admin: CurrentAdmin):
    today = datetime.now(timezone.utc).date()
    
    # Overview metrics
    total_employees = db.scalar(select(func.count()).select_from(Employee).where(Employee.is_active == True)) or 0
    
    attendance_stats = db.execute(
        select(
            func.count(case((Attendance.status == 'present', 1))),
            func.count(case((Attendance.status == 'late', 1))),
            func.count(case((Attendance.status == 'absent', 1))),
        ).where(Attendance.date == today)
    ).fetchone()
    
    present_count, late_count, absent_count = attendance_stats if attendance_stats else (0, 0, 0)
    
    leave_count = db.scalar(select(func.count()).select_from(LeaveRequest).where(LeaveRequest.start_date <= today, LeaveRequest.end_date >= today, LeaveRequest.status == "approved")) or 0
    open_tasks = db.scalar(select(func.count()).select_from(ProjectTask).where(ProjectTask.status != "done")) or 0
    
    pending_leaves = db.scalars(select(LeaveRequest).where(LeaveRequest.status == "pending").limit(3)).all()
    
    # Recent activity (AuditLogs)
    activities = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(5)).all()
    
    return AdminDashboardResponse(
        overview={
            "total_employees": total_employees,
            "present": present_count,
            "on_leave": leave_count,
            "open_tasks": open_tasks
        },
        attendance_today={
            "present": present_count,
            "late": late_count,
            "absent": absent_count,
            "on_leave": leave_count
        },
        pending_leave=[{"id": str(l.id), "employee": f"{l.employee.user.first_name}" if l.employee and l.employee.user else "Unknown"} for l in pending_leaves],
        recent_activity=[{"id": str(a.id), "action": a.action, "entity": a.entity_name} for a in activities],
        tasks=[],
        projects=[],
        announcements=[],
        documents=[]
    )
