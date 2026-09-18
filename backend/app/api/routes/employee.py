from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import joinedload

from app.api.deps import CurrentAdmin, CurrentManager, DatabaseSession, CurrentUser
from app.models.employee import Employee
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.role import Role
from app.models.attendance import Attendance
from app.models.task import ProjectTask, task_assignees
from app.models.lead import Lead, LeadActivity
from app.models.leave import LeaveRequest
from app.core.security import hash_password
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    WorkforceActivityOverview,
    EmployeeProgressItem,
    ActivityFeedItem,
    TaskProgress,
    AttendanceSummary,
    LeadSummary,
    EmployeeDetailActivity,
)
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


@router.get("/activity/overview", response_model=WorkforceActivityOverview)
def get_workforce_activity_overview(
    db: DatabaseSession,
    current_manager: CurrentManager,
):
    today = date.today()

    # 1. Fetch all employees with linked user and department
    employees = (
        db.query(Employee)
        .options(joinedload(Employee.user), joinedload(Employee.department))
        .all()
    )

    # 2. Today's attendance
    today_attendances = {
        att.employee_id: att
        for att in db.query(Attendance).filter(Attendance.date == today).all()
    }

    # 3. Approved leaves today
    approved_leaves_today = set(
        db.scalars(
            select(LeaveRequest.employee_id).where(
                LeaveRequest.status == "approved",
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today,
            )
        ).all()
    )

    # 4. Attendance aggregates per employee
    att_stats = (
        db.query(
            Attendance.employee_id,
            Attendance.status,
            func.count(Attendance.id),
        )
        .group_by(Attendance.employee_id, Attendance.status)
        .all()
    )

    att_map: dict[UUID, dict[str, int]] = {}
    for emp_id, st, cnt in att_stats:
        if emp_id not in att_map:
            att_map[emp_id] = {}
        att_map[emp_id][st] = cnt

    # 5. Task aggregates per user
    task_stats = (
        db.query(
            task_assignees.c.user_id,
            ProjectTask.status,
            func.count(ProjectTask.id),
        )
        .join(ProjectTask, ProjectTask.id == task_assignees.c.task_id)
        .group_by(task_assignees.c.user_id, ProjectTask.status)
        .all()
    )

    assigned_stats = (
        db.query(
            ProjectTask.assigned_to_id,
            ProjectTask.status,
            func.count(ProjectTask.id),
        )
        .filter(ProjectTask.assigned_to_id.isnot(None))
        .group_by(ProjectTask.assigned_to_id, ProjectTask.status)
        .all()
    )

    task_map: dict[UUID, dict[str, int]] = {}
    for uid, st, cnt in task_stats:
        if uid not in task_map:
            task_map[uid] = {}
        task_map[uid][st] = task_map[uid].get(st, 0) + cnt

    for uid, st, cnt in assigned_stats:
        if uid not in task_map:
            task_map[uid] = {}
        if st not in task_map[uid]:
            task_map[uid][st] = cnt

    # 6. Leads aggregates per user
    lead_stats = (
        db.query(
            Lead.assigned_exec_id,
            Lead.status,
            func.count(Lead.id),
        )
        .filter(Lead.assigned_exec_id.isnot(None))
        .group_by(Lead.assigned_exec_id, Lead.status)
        .all()
    )

    lead_map: dict[UUID, dict[str, int]] = {}
    for uid, st, cnt in lead_stats:
        if uid not in lead_map:
            lead_map[uid] = {}
        lead_map[uid][st] = cnt

    working_now_count = 0
    matrix: list[EmployeeProgressItem] = []

    for emp in employees:
        user = emp.user
        if not user:
            continue

        emp_name = f"{user.first_name} {user.last_name}".strip() or user.email
        emp_role = user.role.slug if user.role else None

        # Attendance calculation
        emp_att = att_map.get(emp.id, {})
        present_days = emp_att.get("present", 0)
        late_days = emp_att.get("late", 0)
        absent_days = emp_att.get("absent", 0)
        total_att_days = present_days + late_days + absent_days
        punctuality_rate = (
            round((present_days / total_att_days) * 100.0, 1)
            if total_att_days > 0
            else 100.0
        )

        today_rec = today_attendances.get(emp.id)
        if today_rec:
            if today_rec.check_out_time:
                today_status = "checked_out"
            elif today_rec.check_in_time:
                today_status = "checked_in"
                working_now_count += 1
            else:
                today_status = today_rec.status or "present"
            in_str = (
                today_rec.check_in_time.strftime("%I:%M %p")
                if today_rec.check_in_time
                else None
            )
            out_str = (
                today_rec.check_out_time.strftime("%I:%M %p")
                if today_rec.check_out_time
                else None
            )
        elif emp.id in approved_leaves_today:
            today_status = "leave"
            in_str, out_str = None, None
        else:
            today_status = "absent"
            in_str, out_str = None, None

        # Tasks calculation
        u_tasks = task_map.get(user.id, {})
        t_completed = u_tasks.get("done", 0)
        t_in_progress = u_tasks.get("in_progress", 0)
        t_review = u_tasks.get("review", 0)
        t_todo = u_tasks.get("todo", 0)
        t_total = t_completed + t_in_progress + t_review + t_todo
        t_rate = round((t_completed / t_total) * 100.0, 1) if t_total > 0 else 0.0

        # Leads calculation
        u_leads = lead_map.get(user.id, {})
        l_total = sum(u_leads.values())
        l_won = u_leads.get("won", 0)
        l_contacted = (
            u_leads.get("contacted", 0)
            + u_leads.get("qualified", 0)
            + u_leads.get("proposal_sent", 0)
        )

        # Performance score (composite 0-100)
        if t_total > 0:
            perf_score = round(0.6 * t_rate + 0.4 * punctuality_rate, 1)
        else:
            perf_score = punctuality_rate

        matrix.append(
            EmployeeProgressItem(
                id=emp.id,
                user_id=user.id,
                employee_id_string=emp.employee_id_string,
                name=emp_name,
                email=user.email,
                role=emp_role,
                job_title=emp.job_title,
                department_name=emp.department.name if emp.department else None,
                status=emp.status,
                tasks=TaskProgress(
                    total=t_total,
                    completed=t_completed,
                    in_progress=t_in_progress,
                    review=t_review,
                    todo=t_todo,
                    completion_rate=t_rate,
                ),
                attendance=AttendanceSummary(
                    present_days=present_days,
                    late_days=late_days,
                    absent_days=absent_days,
                    punctuality_rate=punctuality_rate,
                    today_status=today_status,
                    today_check_in=in_str,
                    today_check_out=out_str,
                ),
                leads=LeadSummary(
                    total_assigned=l_total,
                    contacted=l_contacted,
                    won=l_won,
                ),
                performance_score=perf_score,
            )
        )

    all_total_tasks = sum(m.tasks.total for m in matrix)
    all_completed_tasks = sum(m.tasks.completed for m in matrix)
    overall_completion = (
        round((all_completed_tasks / all_total_tasks) * 100.0, 1)
        if all_total_tasks > 0
        else 0.0
    )
    overall_punc = (
        round(sum(m.attendance.punctuality_rate for m in matrix) / len(matrix), 1)
        if matrix
        else 100.0
    )

    # 7. Collect recent activities
    raw_activities: list[ActivityFeedItem] = []

    # Recent attendance
    recent_att = (
        db.query(Attendance)
        .options(joinedload(Attendance.employee).joinedload(Employee.user))
        .order_by(Attendance.updated_at.desc())
        .limit(30)
        .all()
    )
    for att in recent_att:
        u = att.employee.user if att.employee else None
        u_name = f"{u.first_name} {u.last_name}".strip() if u else "Staff Member"
        action_name = "CHECK_OUT" if att.check_out_time else "CHECK_IN"
        time_str = (
            att.check_out_time.strftime("%I:%M %p")
            if att.check_out_time
            else (
                att.check_in_time.strftime("%I:%M %p")
                if att.check_in_time
                else "Today"
            )
        )
        raw_activities.append(
            ActivityFeedItem(
                id=f"att-{att.id}",
                user_id=u.id if u else None,
                employee_id=att.employee_id,
                employee_name=u_name,
                employee_code=att.employee.employee_id_string if att.employee else None,
                activity_type="attendance",
                action=action_name,
                title=f"{u_name} {'Checked Out' if att.check_out_time else 'Checked In'}",
                description=f"Attendance record marked as {att.status} at {time_str}",
                timestamp=att.updated_at or att.created_at,
            )
        )

    # Recent tasks
    recent_tasks = (
        db.query(ProjectTask)
        .options(joinedload(ProjectTask.assigned_to))
        .order_by(ProjectTask.updated_at.desc())
        .limit(30)
        .all()
    )
    for t in recent_tasks:
        assignee_name = (
            f"{t.assigned_to.first_name} {t.assigned_to.last_name}".strip()
            if t.assigned_to
            else "Workforce"
        )
        status_label = t.status.replace("_", " ").title()
        raw_activities.append(
            ActivityFeedItem(
                id=f"task-{t.id}",
                user_id=t.assigned_to_id,
                employee_name=assignee_name,
                activity_type="task",
                action=f"TASK_{t.status.upper()}",
                title=f"Task {status_label}",
                description=f"'{t.title}' ({t.priority.upper()} priority)",
                timestamp=t.updated_at or t.created_at,
            )
        )

    # Recent leads
    recent_leads = (
        db.query(LeadActivity)
        .options(joinedload(LeadActivity.author), joinedload(LeadActivity.lead))
        .order_by(LeadActivity.created_at.desc())
        .limit(20)
        .all()
    )
    for la in recent_leads:
        auth_name = (
            f"{la.author.first_name} {la.author.last_name}".strip()
            if la.author
            else "Sales Executive"
        )
        lead_comp = la.lead.company_name if la.lead else "Client"
        raw_activities.append(
            ActivityFeedItem(
                id=f"lead-{la.id}",
                user_id=la.author_id,
                employee_name=auth_name,
                activity_type="lead",
                action=f"LEAD_{la.type.upper()}",
                title=f"Lead {la.type.title()}: {lead_comp}",
                description=la.body[:140] if la.body else "Logged sales activity",
                timestamp=la.created_at,
            )
        )

    raw_activities.sort(key=lambda a: a.timestamp, reverse=True)

    return WorkforceActivityOverview(
        total_employees=len(matrix),
        working_now=working_now_count,
        tasks_completed_today=all_completed_tasks,
        overall_completion_rate=overall_completion,
        overall_punctuality_rate=overall_punc,
        progress_matrix=matrix,
        recent_activities=raw_activities[:60],
    )


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


@router.get("/{id}/activity", response_model=EmployeeDetailActivity)
def get_employee_activity_detail(
    id: UUID,
    db: DatabaseSession,
    current_manager: CurrentManager,
):
    employee = (
        db.query(Employee)
        .options(joinedload(Employee.user), joinedload(Employee.department))
        .filter(Employee.id == id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    user = employee.user
    if not user:
        raise HTTPException(status_code=400, detail="Employee has no linked user account")

    today = date.today()

    # Tasks for this user
    user_tasks = (
        db.query(ProjectTask)
        .outerjoin(ProjectTask.assignees)
        .filter(or_(ProjectTask.assigned_to_id == user.id, User.id == user.id))
        .distinct()
        .order_by(ProjectTask.updated_at.desc())
        .all()
    )

    t_completed = sum(1 for t in user_tasks if t.status == "done")
    t_in_progress = sum(1 for t in user_tasks if t.status == "in_progress")
    t_review = sum(1 for t in user_tasks if t.status == "review")
    t_todo = sum(1 for t in user_tasks if t.status == "todo")
    t_total = len(user_tasks)
    t_rate = round((t_completed / t_total) * 100.0, 1) if t_total > 0 else 0.0

    # Attendance for this employee (last 30 records)
    att_records = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee.id)
        .order_by(Attendance.date.desc())
        .limit(30)
        .all()
    )

    present_days = sum(1 for a in att_records if a.status == "present")
    late_days = sum(1 for a in att_records if a.status == "late")
    absent_days = sum(1 for a in att_records if a.status == "absent")
    total_att = len(att_records)
    punctuality = (
        round((present_days / total_att) * 100.0, 1)
        if total_att > 0
        else 100.0
    )

    today_rec = next((a for a in att_records if a.date == today), None)
    if today_rec:
        if today_rec.check_out_time:
            today_status = "checked_out"
        elif today_rec.check_in_time:
            today_status = "checked_in"
        else:
            today_status = today_rec.status or "present"
        in_str = (
            today_rec.check_in_time.strftime("%I:%M %p")
            if today_rec.check_in_time
            else None
        )
        out_str = (
            today_rec.check_out_time.strftime("%I:%M %p")
            if today_rec.check_out_time
            else None
        )
    else:
        today_status = "absent"
        in_str, out_str = None, None

    # Leads for this user
    user_leads = db.query(Lead).filter(Lead.assigned_exec_id == user.id).all()
    l_total = len(user_leads)
    l_won = sum(1 for l in user_leads if l.status == "won")
    l_contacted = sum(
        1 for l in user_leads if l.status in ("contacted", "qualified", "proposal_sent")
    )

    perf_score = (
        round(0.6 * t_rate + 0.4 * punctuality, 1)
        if t_total > 0
        else punctuality
    )

    progress_item = EmployeeProgressItem(
        id=employee.id,
        user_id=user.id,
        employee_id_string=employee.employee_id_string,
        name=f"{user.first_name} {user.last_name}".strip() or user.email,
        email=user.email,
        role=user.role.slug if user.role else None,
        job_title=employee.job_title,
        department_name=employee.department.name if employee.department else None,
        status=employee.status,
        tasks=TaskProgress(
            total=t_total,
            completed=t_completed,
            in_progress=t_in_progress,
            review=t_review,
            todo=t_todo,
            completion_rate=t_rate,
        ),
        attendance=AttendanceSummary(
            present_days=present_days,
            late_days=late_days,
            absent_days=absent_days,
            punctuality_rate=punctuality,
            today_status=today_status,
            today_check_in=in_str,
            today_check_out=out_str,
        ),
        leads=LeadSummary(
            total_assigned=l_total,
            contacted=l_contacted,
            won=l_won,
        ),
        performance_score=perf_score,
    )

    serialized_tasks = [
        {
            "id": str(t.id),
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for t in user_tasks[:15]
    ]

    serialized_attendance = [
        {
            "id": str(a.id),
            "date": a.date.isoformat(),
            "status": a.status,
            "check_in_time": a.check_in_time.isoformat() if a.check_in_time else None,
            "check_out_time": a.check_out_time.isoformat() if a.check_out_time else None,
        }
        for a in att_records[:15]
    ]

    emp_activities: list[ActivityFeedItem] = []
    for a in att_records[:10]:
        time_str = (
            a.check_out_time.strftime("%I:%M %p")
            if a.check_out_time
            else (a.check_in_time.strftime("%I:%M %p") if a.check_in_time else "Day Log")
        )
        emp_activities.append(
            ActivityFeedItem(
                id=f"emp-att-{a.id}",
                user_id=user.id,
                employee_id=employee.id,
                employee_name=progress_item.name,
                employee_code=employee.employee_id_string,
                activity_type="attendance",
                action="CHECK_OUT" if a.check_out_time else "CHECK_IN",
                title=f"{'Checked Out' if a.check_out_time else 'Checked In'}",
                description=f"Logged {a.status} at {time_str}",
                timestamp=a.updated_at or a.created_at,
            )
        )

    for t in user_tasks[:10]:
        emp_activities.append(
            ActivityFeedItem(
                id=f"emp-task-{t.id}",
                user_id=user.id,
                employee_id=employee.id,
                employee_name=progress_item.name,
                employee_code=employee.employee_id_string,
                activity_type="task",
                action=f"TASK_{t.status.upper()}",
                title=f"Task {t.status.replace('_', ' ').title()}",
                description=f"'{t.title}'",
                timestamp=t.updated_at or t.created_at,
            )
        )

    emp_activities.sort(key=lambda x: x.timestamp, reverse=True)

    return EmployeeDetailActivity(
        employee=_to_employee_response(employee),
        progress=progress_item,
        recent_tasks=serialized_tasks,
        recent_attendance=serialized_attendance,
        activities=emp_activities,
    )


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
):
    # Check if user email already exists
    clean_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        if existing_user.employee:
            raise HTTPException(
                status_code=400,
                detail="An employee profile is already attached to this email address",
            )
        # Link to existing user account
        new_user = existing_user
        if payload.first_name and not new_user.first_name:
            new_user.first_name = payload.first_name.strip()
        if payload.last_name and not new_user.last_name:
            new_user.last_name = payload.last_name.strip()
        if payload.role_id and not new_user.role_id:
            new_user.role_id = payload.role_id
        if payload.emergency_contact and not new_user.phone:
            new_user.phone = payload.emergency_contact

        # Provision open.email mailbox if not already provisioned
        if not new_user.openemail_address:
            mailbox = provision_user_mailbox(clean_email)
            if mailbox:
                new_user.openemail_mailbox_id = mailbox.get("id")
                new_user.openemail_address = (
                    mailbox.get("primaryAddress") or clean_email
                )
            else:
                new_user.openemail_address = clean_email
    else:
        # 1. Create User account
        # Provision the open.email mailbox first so the account is created with a
        # working inbox, exactly like Admin → Users. Non-fatal: if the key is
        # absent or the address is taken, we fall back to the account email.
        mailbox = provision_user_mailbox(clean_email)
        new_user = User(
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            email=clean_email,
            password_hash=hash_password(payload.password),
            is_active=True,
            is_verified=True,
            status="approved",
            role_id=payload.role_id,
            openemail_mailbox_id=mailbox.get("id") if mailbox else None,
            openemail_address=(mailbox.get("primaryAddress") if mailbox else None) or clean_email,
            phone=payload.emergency_contact,
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
        status=payload.status or "active",
        address=payload.address,
        emergency_contact=payload.emergency_contact,
    )
    db.add(new_employee)
    db.flush()

    # 3. Create Audit Log
    audit_log = AuditLog(
        user_id=current_admin.id,
        action="ATTACH" if existing_user else "CREATE",
        entity_type="employee",
        entity_id=str(new_employee.id),
        details={
            "employee_id": str(new_employee.id),
            "user_id": str(new_user.id),
            "email": clean_email,
            "attached_existing_user": bool(existing_user),
        },
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
    user_updated_fields: list[str] = []

    user = employee.user
    if user:
        if "email" in update_data:
            new_email = update_data.pop("email")
            if new_email and new_email.strip() and new_email.strip().lower() != user.email.lower():
                clean_email = new_email.strip().lower()
                existing = db.query(User).filter(User.email == clean_email, User.id != user.id).first()
                if existing:
                    raise HTTPException(
                        status_code=400,
                        detail="Email address is already in use by another account",
                    )
                user.email = clean_email
                if not user.openemail_address:
                    user.openemail_address = clean_email
                user_updated_fields.append("email")

        if "name" in update_data:
            new_name = update_data.pop("name")
            if new_name is not None and new_name.strip():
                parts = new_name.strip().split(maxsplit=1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""
                user_updated_fields.append("name")

        if "first_name" in update_data:
            fn = update_data.pop("first_name")
            if fn is not None:
                user.first_name = fn.strip()
                user_updated_fields.append("first_name")

        if "last_name" in update_data:
            ln = update_data.pop("last_name")
            if ln is not None:
                user.last_name = ln.strip()
                user_updated_fields.append("last_name")

        if "phone" in update_data:
            new_phone = update_data.pop("phone")
            if new_phone is not None:
                user.phone = new_phone.strip() if isinstance(new_phone, str) else None
                user_updated_fields.append("phone")
    else:
        for f in ["email", "name", "first_name", "last_name", "phone"]:
            update_data.pop(f, None)

    for key, value in update_data.items():
        setattr(employee, key, value)

    # 3. Create Audit Log
    all_updated = list(update_data.keys()) + user_updated_fields
    if all_updated:
        audit_log = AuditLog(
            user_id=current_admin.id,
            action="UPDATE",
            entity_type="employee",
            entity_id=str(employee.id),
            details={"updated_fields": all_updated},
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
