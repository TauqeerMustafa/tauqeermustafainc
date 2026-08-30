from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from typing import List

from app.api.deps import CurrentUser, DatabaseSession, CurrentManager
from app.models.leave import LeaveRequest
from app.models.employee import Employee
from app.schemas.leave import LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestRead

router = APIRouter(tags=["leave"])

def get_current_employee(db: DatabaseSession, user_id: UUID) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=403, detail="Current user is not mapped to an employee profile")
    return employee

@router.post("/request", response_model=LeaveRequestRead)
def submit_leave_request(payload: LeaveRequestCreate, db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    
    leave = LeaveRequest(
        employee_id=employee.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        leave_type=payload.leave_type,
        reason=payload.reason,
        status="pending"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    
    return LeaveRequestRead(
        id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
        reason=leave.reason,
        status=leave.status,
        created_at=leave.created_at,
        employee_name=f"{current_user.first_name} {current_user.last_name}"
    )

@router.get("/me", response_model=List[LeaveRequestRead])
def get_my_leave_requests(db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    records = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == employee.id)
        .order_by(LeaveRequest.created_at.desc())
    ).all()
    
    return [
        LeaveRequestRead(
            id=r.id,
            employee_id=r.employee_id,
            start_date=r.start_date,
            end_date=r.end_date,
            leave_type=r.leave_type,
            reason=r.reason,
            status=r.status,
            manager_id=r.manager_id,
            manager_notes=r.manager_notes,
            created_at=r.created_at
        ) for r in records
    ]

# Admin routes
@router.get("/admin", response_model=List[LeaveRequestRead])
def get_all_leave_requests(
    db: DatabaseSession,
    current_manager: CurrentManager,
    status: str = Query(None),
    employee_id: UUID = Query(None, alias="employeeId"),
):
    stmt = select(LeaveRequest).order_by(LeaveRequest.created_at.desc())
    if status:
        stmt = stmt.where(LeaveRequest.status == status)
    if employee_id:
        stmt = stmt.where(LeaveRequest.employee_id == employee_id)

    records = db.scalars(stmt).all()
    
    return [
        LeaveRequestRead(
            id=r.id,
            employee_id=r.employee_id,
            start_date=r.start_date,
            end_date=r.end_date,
            leave_type=r.leave_type,
            reason=r.reason,
            status=r.status,
            manager_id=r.manager_id,
            manager_notes=r.manager_notes,
            created_at=r.created_at,
            employee_name=f"{r.employee.user.first_name} {r.employee.user.last_name}" if r.employee and r.employee.user else None
        ) for r in records
    ]

@router.patch("/admin/{leave_id}/status", response_model=LeaveRequestRead)
def update_leave_status(
    leave_id: UUID, payload: LeaveRequestUpdate, db: DatabaseSession, current_manager: CurrentManager
):
    """Approve or reject a request.

    Manager-gated to match ``GET /admin`` above: that already showed the queue to
    execs and team leads, so admin-only decisions left them looking at a list
    they could not act on. ``manager_id`` records who actually decided.
    """
    leave = db.get(LeaveRequest, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = payload.status
    leave.manager_id = current_manager.id
    if payload.manager_notes:
        leave.manager_notes = payload.manager_notes

    db.commit()
    db.refresh(leave)
    
    return LeaveRequestRead(
        id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
        reason=leave.reason,
        status=leave.status,
        manager_id=leave.manager_id,
        manager_notes=leave.manager_notes,
        created_at=leave.created_at,
        employee_name=f"{leave.employee.user.first_name} {leave.employee.user.last_name}" if leave.employee and leave.employee.user else None
    )
