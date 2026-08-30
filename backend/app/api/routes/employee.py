from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.api.deps import CurrentAdmin, DatabaseSession, CurrentUser
from app.models.employee import Employee
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.role import Role
from app.core.security import get_password_hash
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter()

@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    employees = db.query(Employee).all()
    return employees

@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(
    id: UUID,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 1. Create User account
    new_user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        is_active=True,
        is_verified=True,
        status="approved",
        role_id=payload.role_id,
        phone=payload.emergency_contact # Store phone in user too if needed
    )
    db.add(new_user)
    db.flush()

    # 2. Create Employee profile
    new_employee = Employee(
        user_id=new_user.id,
        employee_id_string=payload.employee_id_string,
        job_title=payload.job_title,
        department_id=payload.department_id,
        manager_id=payload.manager_id,
        joining_date=payload.joining_date,
        status=payload.status,
        address=payload.address,
        emergency_contact=payload.emergency_contact,
    )
    db.add(new_employee)
    db.flush()

    # 3. Create Audit Log
    audit_log = AuditLog(
        user_id=current_admin.id,
        action="CREATE",
        entity_type="employee",
        entity_id=str(new_employee.id),
        details={"employee_id": str(new_employee.id), "user_id": str(new_user.id), "email": payload.email}
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.patch("/{id}", response_model=EmployeeResponse)
def update_employee(
    id: UUID,
    payload: EmployeeUpdate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)

    # 3. Create Audit Log
    audit_log = AuditLog(
        user_id=current_admin.id,
        action="UPDATE",
        entity_type="employee",
        entity_id=str(employee.id),
        details={"updated_fields": list(update_data.keys())}
    )
    db.add(audit_log)

    db.commit()
    db.refresh(employee)
    return employee

class StatusUpdate(BaseModel):
    status: str

@router.patch("/{id}/status", response_model=EmployeeResponse)
def update_employee_status(
    id: UUID,
    payload: StatusUpdate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    old_status = employee.status
    employee.status = payload.status
    
    # Optional: also update user active status based on employee status
    if employee.user:
        employee.user.is_active = (payload.status == "active")
        employee.user.status = "approved" if payload.status == "active" else "suspended"

    # Create Audit Log
    audit_log = AuditLog(
        user_id=current_admin.id,
        action="UPDATE_STATUS",
        entity_type="employee",
        entity_id=str(employee.id),
        details={"old_status": old_status, "new_status": payload.status}
    )
    db.add(audit_log)

    db.commit()
    db.refresh(employee)
    return employee
