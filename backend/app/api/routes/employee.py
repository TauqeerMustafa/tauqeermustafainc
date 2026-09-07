from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.api.deps import CurrentAdmin, CurrentManager, DatabaseSession, CurrentUser
from app.models.employee import Employee
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.role import Role
from app.core.security import hash_password
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.services.onboarding import next_employee_number
from app.services.openemail import provision_user_mailbox

router = APIRouter()


def _to_employee_response(employee: Employee) -> EmployeeResponse:
    """Flatten the linked User row into the response.

    The directory needs a name, email and role for every row; without this the
    frontend had to fetch each employee's user separately (and previously just
    rendered blanks).
    """
    user = employee.user
    return EmployeeResponse(
        id=employee.id,
        user_id=employee.user_id,
        employee_id_string=employee.employee_id_string,
        job_title=employee.job_title,
        department_id=employee.department_id,
        manager_id=employee.manager_id,
        joining_date=employee.joining_date,
        status=employee.status,
        address=employee.address,
        emergency_contact=employee.emergency_contact,
        name=f"{user.first_name} {user.last_name}".strip() if user else None,
        email=user.email if user else None,
        phone=user.phone if user else None,
        role=(user.role.slug if user and user.role is not None else None),
    )


@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    db: DatabaseSession,
    current_manager: CurrentManager,
):
    employees = db.query(Employee).all()
    return [_to_employee_response(e) for e in employees]

@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(
    id: UUID,
    db: DatabaseSession,
    current_manager: CurrentManager,
):
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _to_employee_response(employee)

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
    # Provision the open.email mailbox first so the account is created with a
    # working inbox, exactly like Admin → Users. Non-fatal: if the key is
    # absent or the address is taken, we fall back to the account email.
    mailbox = provision_user_mailbox(payload.email)
    new_user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_active=True,
        is_verified=True,
        status="approved",
        role_id=payload.role_id,
        openemail_mailbox_id=mailbox.get("id") if mailbox else None,
        openemail_address=(mailbox.get("primaryAddress") if mailbox else None) or payload.email,
        phone=payload.emergency_contact # Store phone in user too if needed
    )
    db.add(new_user)
    db.flush()

    # 2. Create Employee profile
    new_employee = Employee(
        user_id=new_user.id,
        # The form leaves this blank in the normal case: issue the next staff
        # number rather than storing nothing, so both creation paths — here and
        # Admin → Users — number people the same way.
        employee_id_string=(
            (payload.employee_id_string or "").strip() or next_employee_number(db) or None
        ),
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
    return _to_employee_response(new_employee)

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
    return _to_employee_response(employee)

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
    return _to_employee_response(employee)
