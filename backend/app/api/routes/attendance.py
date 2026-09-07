from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from typing import List

from app.api.deps import CurrentUser, DatabaseSession, CurrentAdmin, CurrentManager
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import AttendanceRead, AttendanceCheckIn, AttendanceCheckOut, AttendanceUpdate

router = APIRouter(tags=["attendance"])

def get_current_employee(db: DatabaseSession, user_id: UUID) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=403, detail="Current user is not mapped to an employee profile")
    return employee

@router.post("/check-in", response_model=AttendanceRead)
def check_in(payload: AttendanceCheckIn, db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    today = datetime.now(timezone.utc).date()
    
    # Check if already checked in today
    existing = db.scalar(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
        
    attendance = Attendance(
        employee_id=employee.id,
        date=today,
        check_in_time=datetime.now(timezone.utc),
        status="present",
        notes=payload.notes
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    return AttendanceRead(
        id=attendance.id,
        employee_id=attendance.employee_id,
        date=attendance.date,
        check_in_time=attendance.check_in_time,
        check_out_time=attendance.check_out_time,
        status=attendance.status,
        notes=attendance.notes,
        employee_name=f"{current_user.first_name} {current_user.last_name}"
    )

@router.post("/check-out", response_model=AttendanceRead)
def check_out(payload: AttendanceCheckOut, db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    today = datetime.now(timezone.utc).date()
    
    attendance = db.scalar(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    if not attendance:
        raise HTTPException(status_code=400, detail="You must check in first")
        
    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Already checked out today")
        
    attendance.check_out_time = datetime.now(timezone.utc)
    if payload.notes:
        attendance.notes = (attendance.notes + " | " + payload.notes) if attendance.notes else payload.notes
        
    db.commit()
    db.refresh(attendance)
    
    return AttendanceRead(
        id=attendance.id,
        employee_id=attendance.employee_id,
        date=attendance.date,
        check_in_time=attendance.check_in_time,
        check_out_time=attendance.check_out_time,
        status=attendance.status,
        notes=attendance.notes,
        employee_name=f"{current_user.first_name} {current_user.last_name}"
    )

@router.get("/me", response_model=List[AttendanceRead])
def get_my_attendance(db: DatabaseSession, current_user: CurrentUser, limit: int = 30):
    employee = get_current_employee(db, current_user.id)
    records = db.scalars(
        select(Attendance)
        .where(Attendance.employee_id == employee.id)
        .order_by(Attendance.date.desc())
        .limit(limit)
    ).all()
    
    return [
        AttendanceRead(
            id=r.id,
            employee_id=r.employee_id,
            date=r.date,
            check_in_time=r.check_in_time,
            check_out_time=r.check_out_time,
            status=r.status,
            notes=r.notes
        ) for r in records
    ]

# Admin routes for attendance
@router.get("/admin", response_model=List[AttendanceRead])
def get_all_attendance(
    db: DatabaseSession,
    current_manager: CurrentManager,
    date_str: str = Query(None, alias="date"),
    employee_id: UUID = Query(None, alias="employeeId"),
):
    """Daily roster by default. Passing `employeeId` switches to that one
    person's history instead, which is what the employee profile page reads."""
    stmt = select(Attendance)

    if employee_id:
        stmt = stmt.where(Attendance.employee_id == employee_id).order_by(Attendance.date.desc())
    else:
        query_date = (
            datetime.strptime(date_str, "%Y-%m-%d").date()
            if date_str
            else datetime.now(timezone.utc).date()
        )
        stmt = stmt.where(Attendance.date == query_date).order_by(Attendance.check_in_time.desc())

    records = db.scalars(stmt).all()

    return [
        AttendanceRead(
            id=r.id,
            employee_id=r.employee_id,
            date=r.date,
            check_in_time=r.check_in_time,
            check_out_time=r.check_out_time,
            status=r.status,
            notes=r.notes,
            employee_name=f"{r.employee.user.first_name} {r.employee.user.last_name}" if r.employee and r.employee.user else None
        ) for r in records
    ]
