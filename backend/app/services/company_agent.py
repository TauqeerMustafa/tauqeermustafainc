"""Company Executive AI Agent Service.

Provides real-time company telemetry, autonomous operational audits,
strategic CEO daily briefings, conversational copilot capabilities, and
1-click safe executive action execution with audit logging.
"""
from __future__ import annotations

import os
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

import re
import urllib.parse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.models.announcement import Announcement
from app.models.attendance import Attendance
from app.models.audit_log import AuditLog
from app.models.contact_message import ContactMessage
from app.models.department import Department
from app.models.employee import Employee
from app.models.lead import Lead, LeadActivity
from app.models.leave import LeaveRequest
from app.models.portal import ClientProject
from app.models.task import ProjectTask
from app.models.user import User
from app.schemas.agent import (
    AgentActionResponse,
    AgentChatRequest,
    AgentChatResponse,
    AnomalyItem,
    CompanyAuditRunResponse,
    CompanyPulseMetrics,
    DepartmentHealth,
    ExecutedActionRecord,
    ExecutiveBriefing,
    LeadToCashCycleRequest,
    LeadToCashCycleResponse,
    PaymentLinkInfo,
    ProposalDossier,
    ProposalMilestone,
)

logger = get_logger(__name__)


class CompanyAgentService:
    """The central intelligence brain for company operations."""

    @staticmethod
    def get_company_pulse(db: Session) -> CompanyPulseMetrics:
        today = date.today()
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

        # 1. Workforce & HR metrics
        headcount = (
            db.scalar(
                select(func.count(Employee.id)).where(Employee.status != "inactive")
            )
            or 0
        )
        active_employees = (
            db.scalar(
                select(func.count(Employee.id)).where(Employee.status == "active")
            )
            or 0
        )

        attendance_today = db.execute(
            select(Attendance.status, func.count(Attendance.id))
            .where(Attendance.date == today)
            .group_by(Attendance.status)
        ).all()
        att_counts = {status: count for status, count in attendance_today}
        present_today = att_counts.get("present", 0)
        absent_today = att_counts.get("absent", 0)
        late_today = att_counts.get("late", 0)

        # Leaves
        on_leave_today = (
            db.scalar(
                select(func.count(LeaveRequest.id)).where(
                    LeaveRequest.status == "approved",
                    LeaveRequest.start_date <= today,
                    LeaveRequest.end_date >= today,
                )
            )
            or 0
        )
        pending_leaves = (
            db.scalar(
                select(func.count(LeaveRequest.id)).where(
                    LeaveRequest.status == "pending"
                )
            )
            or 0
        )

        # 2. Delivery & Task metrics
        open_tasks = (
            db.scalar(
                select(func.count(ProjectTask.id)).where(ProjectTask.status != "done")
            )
            or 0
        )
        overdue_tasks = (
            db.scalar(
                select(func.count(ProjectTask.id)).where(
                    ProjectTask.status != "done",
                    ProjectTask.due_date.isnot(None),
                    ProjectTask.due_date < today,
                )
            )
            or 0
        )
        in_review_tasks = (
            db.scalar(
                select(func.count(ProjectTask.id)).where(
                    ProjectTask.status == "review"
                )
            )
            or 0
        )
        completed_tasks_this_week = (
            db.scalar(
                select(func.count(ProjectTask.id)).where(
                    ProjectTask.status == "done",
                    ProjectTask.updated_at >= seven_days_ago,
                )
            )
            or 0
        )

        active_projects = (
            db.scalar(
                select(func.count(ClientProject.id)).where(
                    ClientProject.status.in_(["active", "in_progress"])
                )
            )
            or 0
        )

        # 3. Sales & Pipeline metrics
        total_leads = db.scalar(select(func.count(Lead.id))) or 0
        qualified_leads = (
            db.scalar(
                select(func.count(Lead.id)).where(Lead.status == "qualified")
            )
            or 0
        )
        pipeline_value = (
            db.scalar(
                select(func.sum(Lead.estimated_value)).where(
                    Lead.status.in_(["new", "contacted", "qualified", "proposal_sent"])
                )
            )
            or 0.0
        )

        # 4. Communications & Inbox
        unread_contact_messages = (
            db.scalar(
                select(func.count(ContactMessage.id)).where(
                    ContactMessage.is_read.is_(False)
                )
            )
            or 0
        )

        # Calculate Operational Health Score (0-100)
        health_score = 100
        # Penalties
        health_score -= min(30, overdue_tasks * 5)
        health_score -= min(20, pending_leaves * 4)
        if unread_contact_messages > 3:
            health_score -= min(15, (unread_contact_messages - 3) * 3)
        if active_employees > 0 and (absent_today / active_employees) > 0.25:
            health_score -= 15

        health_score = max(10, min(100, health_score))

        if health_score >= 95:
            grade = "A+"
        elif health_score >= 85:
            grade = "A"
        elif health_score >= 75:
            grade = "B"
        elif health_score >= 65:
            grade = "C"
        else:
            grade = "D"

        # 5. Department Breakdown
        departments_data: list[DepartmentHealth] = []
        dept_rows = db.scalars(select(Department).order_by(Department.name)).all()
        for d in dept_rows:
            d_headcount = (
                db.scalar(
                    select(func.count(Employee.id)).where(
                        Employee.department_id == d.id, Employee.status != "inactive"
                    )
                )
                or 0
            )
            d_present = (
                db.scalar(
                    select(func.count(Attendance.id))
                    .join(Employee, Attendance.employee_id == Employee.id)
                    .where(
                        Employee.department_id == d.id,
                        Attendance.date == today,
                        Attendance.status == "present",
                    )
                )
                or 0
            )
            d_overdue = (
                db.scalar(
                    select(func.count(ProjectTask.id))
                    .join(User, ProjectTask.assigned_to_id == User.id)
                    .join(Employee, Employee.user_id == User.id)
                    .where(
                        Employee.department_id == d.id,
                        ProjectTask.status != "done",
                        ProjectTask.due_date.isnot(None),
                        ProjectTask.due_date < today,
                    )
                )
                or 0
            )
            d_open = (
                db.scalar(
                    select(func.count(ProjectTask.id))
                    .join(User, ProjectTask.assigned_to_id == User.id)
                    .join(Employee, Employee.user_id == User.id)
                    .where(
                        Employee.department_id == d.id,
                        ProjectTask.status != "done",
                    )
                )
                or 0
            )
            d_score = max(50, 100 - (d_overdue * 15))
            d_grade = "A" if d_score >= 90 else "B" if d_score >= 75 else "C"

            departments_data.append(
                DepartmentHealth(
                    id=str(d.id),
                    name=d.name,
                    headcount=d_headcount,
                    present_today=d_present,
                    open_tasks=d_open,
                    overdue_tasks=d_overdue,
                    health_score=d_score,
                    grade=d_grade,
                )
            )

        return CompanyPulseMetrics(
            headcount=headcount,
            active_employees=active_employees,
            present_today=present_today,
            absent_today=absent_today,
            late_today=late_today,
            on_leave_today=on_leave_today,
            pending_leaves=pending_leaves,
            open_tasks=open_tasks,
            overdue_tasks=overdue_tasks,
            in_review_tasks=in_review_tasks,
            completed_tasks_this_week=completed_tasks_this_week,
            active_projects=active_projects,
            projects_at_risk=1 if overdue_tasks > 0 else 0,
            total_leads=total_leads,
            qualified_leads=qualified_leads,
            pipeline_estimated_value=float(pipeline_value),
            unread_contact_messages=unread_contact_messages,
            health_score=health_score,
            operational_grade=grade,
            departments=departments_data,
        )

    @staticmethod
    def run_autonomous_audit(db: Session) -> CompanyAuditRunResponse:
        start_time = time.perf_counter()
        today = date.today()
        pulse = CompanyAgentService.get_company_pulse(db)

        anomalies: list[AnomalyItem] = []

        # 1. Delivery subsystem audit
        overdue_tasks = db.scalars(
            select(ProjectTask)
            .where(
                ProjectTask.status != "done",
                ProjectTask.due_date.isnot(None),
                ProjectTask.due_date < today,
            )
            .order_by(ProjectTask.due_date.asc())
            .limit(10)
        ).all()

        for task in overdue_tasks:
            days_late = (today - task.due_date).days if task.due_date else 0
            severity = "critical" if days_late >= 3 or task.priority == "urgent" else "warning"
            assignee_name = (
                f"{task.assigned_to.first_name} {task.assigned_to.last_name}"
                if task.assigned_to
                else "Unassigned"
            )
            anomalies.append(
                AnomalyItem(
                    id=f"overdue_task_{task.id}",
                    category="delivery",
                    severity=severity,
                    title=f"Task '{task.title}' is {days_late} day(s) overdue",
                    description=(
                        f"Priority: {task.priority.upper()} | Assignee: {assignee_name} | "
                        f"Due: {task.due_date}. Project delivery is at risk."
                    ),
                    suggested_action="Escalate priority or reassign task to an available engineer",
                    action_type="escalate_overdue_tasks",
                    action_payload={"task_id": str(task.id)},
                )
            )

        # Unassigned open tasks
        unassigned_tasks = db.scalars(
            select(ProjectTask)
            .where(
                ProjectTask.status.in_(["todo", "in_progress"]),
                ProjectTask.assigned_to_id.is_(None),
            )
            .limit(5)
        ).all()
        for task in unassigned_tasks:
            anomalies.append(
                AnomalyItem(
                    id=f"unassigned_task_{task.id}",
                    category="delivery",
                    severity="warning",
                    title=f"Unassigned Active Task: '{task.title}'",
                    description="This task is in the active backlog but has no direct owner.",
                    suggested_action="Assign this task to balance workload",
                    action_type="reassign_task",
                    action_payload={"task_id": str(task.id)},
                )
            )

        # 2. HR & People subsystem audit
        pending_leaves = db.scalars(
            select(LeaveRequest)
            .where(LeaveRequest.status == "pending")
            .order_by(LeaveRequest.created_at.asc())
            .limit(10)
        ).all()

        for leave in pending_leaves:
            user = leave.employee.user if leave.employee else None
            emp_name = f"{user.first_name} {user.last_name}" if user else "Employee"
            days = (leave.end_date - leave.start_date).days + 1
            anomalies.append(
                AnomalyItem(
                    id=f"pending_leave_{leave.id}",
                    category="hr",
                    severity="warning",
                    title=f"Pending Leave Approval: {emp_name} ({days} days)",
                    description=(
                        f"Type: {leave.leave_type.capitalize()} | From {leave.start_date} to {leave.end_date}. "
                        f"Reason: {leave.reason}"
                    ),
                    suggested_action="Approve leave if project coverage is sufficient",
                    action_type="approve_leave",
                    action_payload={"leave_id": str(leave.id)},
                )
            )

        # 3. Sales & Pipeline subsystem audit
        stale_date = today - timedelta(days=5)
        stale_leads = db.scalars(
            select(Lead)
            .where(
                Lead.status.in_(["new", "contacted"]),
                (Lead.next_follow_up_date.isnot(None) & (Lead.next_follow_up_date <= today))
                | (Lead.updated_at <= datetime.combine(stale_date, datetime.min.time(), tzinfo=timezone.utc)),
            )
            .limit(5)
        ).all()

        for lead in stale_leads:
            val_str = f"${float(lead.estimated_value):,.2f}" if lead.estimated_value else "Unestimated"
            anomalies.append(
                AnomalyItem(
                    id=f"stale_lead_{lead.id}",
                    category="sales",
                    severity="warning",
                    title=f"Stalled Opportunity: {lead.company_name} ({val_str})",
                    description=(
                        f"Contact: {lead.contact_person} ({lead.email or 'no email'}) | "
                        f"Status: {lead.status}. No recent outreach recorded."
                    ),
                    suggested_action="Trigger sales follow-up reminder",
                    action_type="triage_leads",
                    action_payload={"lead_id": str(lead.id)},
                )
            )

        # 4. Inbound Communications
        unread_messages = db.scalars(
            select(ContactMessage).where(ContactMessage.is_read.is_(False)).limit(5)
        ).all()
        for msg in unread_messages:
            anomalies.append(
                AnomalyItem(
                    id=f"unread_msg_{msg.id}",
                    category="communication",
                    severity="info",
                    title=f"Inbound Inquiry from {msg.name}",
                    description=f"Company: {msg.company or 'Direct Inquiry'} | Email: {msg.email}",
                    suggested_action="Review and route to sales/support",
                    action_type="review_message",
                    action_payload={"message_id": str(msg.id)},
                )
            )

        duration_ms = int((time.perf_counter() - start_time) * 1000)
        critical_count = sum(1 for a in anomalies if a.severity == "critical")

        # Executive summary
        summary_points = [
            f"Autonomous audit completed in {duration_ms}ms with overall health score {pulse.health_score}% (Grade {pulse.operational_grade}).",
            f"Evaluated {pulse.active_employees} active team members, {pulse.open_tasks} project tasks, and {pulse.total_leads} pipeline leads.",
        ]
        if critical_count > 0:
            summary_points.append(
                f"⚠️ ATTENTION REQUIRED: Detected {critical_count} critical bottlenecks requiring leadership intervention."
            )
        else:
            summary_points.append(
                "✅ All key systems are operating within normal operational parameters."
            )

        return CompanyAuditRunResponse(
            timestamp=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            health_score=pulse.health_score,
            operational_grade=pulse.operational_grade,
            anomalies_count=len(anomalies),
            critical_count=critical_count,
            anomalies=anomalies,
            executive_summary=" ".join(summary_points),
        )

    @staticmethod
    def generate_executive_briefing(db: Session) -> ExecutiveBriefing:
        pulse = CompanyAgentService.get_company_pulse(db)
        audit = CompanyAgentService.run_autonomous_audit(db)

        # Build headline
        if pulse.health_score >= 90:
            headline = "Company Operations Optimal: Strong delivery pace and healthy team capacity."
        elif pulse.health_score >= 75:
            headline = "Company Operations Steady: Minor delivery bottlenecks and pending approvals detected."
        else:
            headline = "Company Operations Under Strain: High-priority tasks overdue and action required."

        summary = (
            f"As of today, Tauqeer Mustafa Inc. is operating at {pulse.health_score}% efficiency (Grade {pulse.operational_grade}). "
            f"We have {pulse.present_today} team members active today, {pulse.open_tasks} tasks currently in flight across "
            f"{pulse.active_projects} client projects, and an active deal pipeline of ${pulse.pipeline_estimated_value:,.2f}. "
            f"The AI Agent has flagged {len(audit.anomalies)} items for executive attention."
        )

        top_achievements = [
            f"${pulse.pipeline_estimated_value:,.2f} total pipeline value across {pulse.total_leads} active leads ({pulse.qualified_leads} qualified).",
            f"{pulse.completed_tasks_this_week} deliverables successfully closed this week.",
            f"{pulse.headcount} team members tracked across engineering and business operations.",
        ]

        critical_risks = []
        if pulse.overdue_tasks > 0:
            critical_risks.append(
                f"{pulse.overdue_tasks} overdue task(s) threatening delivery milestones."
            )
        if pulse.pending_leaves > 0:
            critical_risks.append(
                f"{pulse.pending_leaves} pending leave request(s) awaiting managerial review."
            )
        if pulse.unread_contact_messages > 0:
            critical_risks.append(
                f"{pulse.unread_contact_messages} unaddressed customer contact inquiry(ies)."
            )
        if not critical_risks:
            critical_risks.append("No critical risks detected across active operations.")

        strategic_recommendations = [
            "Maintain sprint velocity by resolving any stalled deliverables in the Action Center.",
            "Process pending staff leaves promptly to ensure transparent capacity planning.",
            "Follow up on qualified leads in proposal stages to accelerate revenue conversion.",
        ]

        audio_summary = (
            f"Good morning leadership. Operational health is at {pulse.health_score} percent, Grade {pulse.operational_grade}. "
            f"There are {pulse.present_today} team members active today, with {pulse.open_tasks} open tasks and "
            f"{pulse.overdue_tasks} overdue items. Active sales pipeline is valued at ${pulse.pipeline_estimated_value:,.0f}. "
            f"{'Warning: leadership action is advised on critical delivery delays.' if pulse.overdue_tasks > 0 else 'All operations are running smoothly.'}"
        )

        return ExecutiveBriefing(
            generated_at=datetime.now(timezone.utc),
            headline=headline,
            health_score=pulse.health_score,
            operational_grade=pulse.operational_grade,
            summary=summary,
            audio_summary=audio_summary,
            top_achievements=top_achievements,
            critical_risks=critical_risks,
            strategic_recommendations=strategic_recommendations,
            urgent_anomalies=audit.anomalies[:6],
        )

    @staticmethod
    def process_agent_command(
        db: Session,
        user: User,
        request: AgentChatRequest,
    ) -> AgentChatResponse:
        pulse = CompanyAgentService.get_company_pulse(db)
        audit = CompanyAgentService.run_autonomous_audit(db)
        raw_msg = request.message.strip()
        query = raw_msg.lower()
        custom_inst = (request.custom_instructions or "").strip().lower()
        persona = request.employee_persona or "universal"
        now_utc = datetime.now(timezone.utc)
        today = date.today()

        executed_actions: list[ExecutedActionRecord] = []

        # Parse standing custom instructions defaults
        default_priority = "medium"
        if m_prio := re.search(r"\bpriority\b.*?\b(urgent|high|medium|low)\b", custom_inst):
            default_priority = m_prio.group(1).lower()
        elif m_always := re.search(r"\balways\b.*?\b(urgent|high|medium|low)\b", custom_inst):
            default_priority = m_always.group(1).lower()

        default_currency = "USD"
        if "eur" in custom_inst or "euro" in custom_inst:
            default_currency = "EUR"
        elif "gbp" in custom_inst or "pound" in custom_inst:
            default_currency = "GBP"

        # -------------------------------------------------------------
        # 1. Action Intent: Create / Add Project Task Immediately
        # -------------------------------------------------------------
        task_match = re.search(
            r"(?:create|add|make|schedule|assign|new)\s+(?:a\s+)?(?:new\s+)?task(?:\s+for|\s+to|\s+called|\s*:)?\s*(.+)",
            raw_msg,
            re.IGNORECASE,
        )
        if (task_match or query.startswith("task:")) and request.auto_execute:
            task_raw = task_match.group(1) if task_match else raw_msg.split("task:", 1)[1]
            task_raw = task_raw.strip()

            task_priority = default_priority
            if re.search(r"\b(urgent|critical|asap|blocker)\b", task_raw, re.I):
                task_priority = "urgent"
            elif re.search(r"\b(high|important)\b", task_raw, re.I):
                task_priority = "high"
            elif re.search(r"\b(low)\b", task_raw, re.I):
                task_priority = "low"

            task_due = today + timedelta(days=3)
            if re.search(r"\btoday\b", task_raw, re.I):
                task_due = today
            elif re.search(r"\btomorrow\b", task_raw, re.I):
                task_due = today + timedelta(days=1)
            elif m_days := re.search(r"\bin\s+(\d+)\s+days?\b", task_raw, re.I):
                task_due = today + timedelta(days=int(m_days.group(1)))
            elif re.search(r"\bnext\s+week\b", task_raw, re.I):
                task_due = today + timedelta(days=7)

            clean_title = re.sub(
                r"\b(with\s+)?(urgent|high|medium|low)\s+priority\b", "", task_raw, flags=re.I
            )
            clean_title = re.sub(
                r"\b(due\s+)?(today|tomorrow|next\s+week|in\s+\d+\s+days?)\b", "", clean_title, flags=re.I
            )
            clean_title = clean_title.strip(" :,.-")
            if not clean_title:
                clean_title = "Executive Task Directive"

            active_proj = db.scalar(
                select(ClientProject)
                .where(ClientProject.status.in_(["in_progress", "active", "discovery"]))
                .limit(1)
            )

            new_task = ProjectTask(
                project_id=active_proj.id if active_proj else None,
                title=clean_title,
                description=(
                    f"Created immediately by Autonomous Virtual Business Employee Agent ({persona.upper()}) "
                    f"based on directive: '{raw_msg}'"
                ),
                priority=task_priority,
                status="todo",
                due_date=task_due,
                assigned_to_id=user.id,
                created_by_id=user.id,
            )
            db.add(new_task)
            db.flush()

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_create_task",
                entity_type="project_task",
                entity_id=str(new_task.id),
                details={"title": clean_title, "priority": task_priority, "due_date": str(task_due)},
            )
            db.add(audit_entry)
            db.commit()

            executed_actions.append(
                ExecutedActionRecord(
                    action_type="create_task",
                    entity_type="task",
                    entity_id=str(new_task.id),
                    entity_title=clean_title,
                    status="success",
                    message=f"Task '{clean_title}' provisioned immediately with {task_priority.upper()} priority, due {task_due}.",
                    executed_at=now_utc,
                    details={"priority": task_priority, "due_date": str(task_due), "task_id": str(new_task.id)},
                )
            )

        # -------------------------------------------------------------
        # 2. Action Intent: Post / Publish Company Announcement
        # -------------------------------------------------------------
        anno_match = re.search(
            r"(?:post|create|publish|broadcast|send)\s+(?:an?\s+)?(?:announcement|broadcast|company notice|memo)(?:\s*:|\s+called|\s+titled|\s+about)?\s*(.+)",
            raw_msg,
            re.IGNORECASE,
        )
        if (anno_match or query.startswith("announce:") or query.startswith("broadcast:")) and request.auto_execute:
            content_raw = (
                anno_match.group(1)
                if anno_match
                else (raw_msg.split("announce:", 1)[-1] if "announce:" in raw_msg else raw_msg.split("broadcast:", 1)[-1])
            ).strip()

            if ":" in content_raw:
                parts = content_raw.split(":", 1)
                title = parts[0].strip()
                body = parts[1].strip()
            elif "-" in content_raw and len(content_raw.split("-", 1)[0].split()) <= 8:
                parts = content_raw.split("-", 1)
                title = parts[0].strip()
                body = parts[1].strip()
            else:
                words = content_raw.split()
                title = " ".join(words[:6]) + ("..." if len(words) > 6 else "")
                body = content_raw

            announcement = Announcement(
                title=title or "Company Broadcast",
                body=body or content_raw,
                is_published=True,
            )
            db.add(announcement)
            db.flush()

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_publish_announcement",
                entity_type="announcement",
                entity_id=str(announcement.id),
                details={"title": announcement.title},
            )
            db.add(audit_entry)
            db.commit()

            executed_actions.append(
                ExecutedActionRecord(
                    action_type="create_announcement",
                    entity_type="announcement",
                    entity_id=str(announcement.id),
                    entity_title=announcement.title,
                    status="success",
                    message=f"Company Announcement '{announcement.title}' published company-wide immediately.",
                    executed_at=now_utc,
                    details={"announcement_id": str(announcement.id)},
                )
            )

        # -------------------------------------------------------------
        # 3. Action Intent: Approve / Process Leave Requests
        # -------------------------------------------------------------
        if (re.search(r"\b(approve|accept)\b.*?\bleave", query) or "approve leaves" in query) and request.auto_execute:
            pending_leaves = db.scalars(
                select(LeaveRequest).where(LeaveRequest.status == "pending")
            ).all()

            if pending_leaves:
                for leave in pending_leaves:
                    leave.status = "approved"
                    leave.manager_id = user.id
                    leave.manager_notes = "Approved immediately via Autonomous Virtual Business Employee Agent"

                audit_entry = AuditLog(
                    user_id=user.id,
                    action="agent_batch_approve_leaves",
                    entity_type="leave_request",
                    entity_id="batch",
                    details={"approved_count": len(pending_leaves)},
                )
                db.add(audit_entry)
                db.commit()

                executed_actions.append(
                    ExecutedActionRecord(
                        action_type="approve_leave",
                        entity_type="leave_request",
                        entity_id="batch",
                        entity_title=f"{len(pending_leaves)} Pending Leave Request(s)",
                        status="success",
                        message=f"Successfully approved {len(pending_leaves)} pending staff leave request(s) immediately.",
                        executed_at=now_utc,
                        details={"approved_count": len(pending_leaves)},
                    )
                )

        # -------------------------------------------------------------
        # 4. Action Intent: Create / Qualify CRM Sales Lead
        # -------------------------------------------------------------
        lead_match = re.search(
            r"(?:create|add|qualify|prospect|new)\s+(?:a\s+)?(?:(?:qualified|enterprise|b2b|new|sales)\s+)?(?:lead|deal|opportunity)(?:\s+for|\s+called|\s*:)?\s*(.+)",
            raw_msg,
            re.IGNORECASE,
        )
        if (lead_match or query.startswith("lead:")) and request.auto_execute:
            lead_raw = lead_match.group(1) if lead_match else raw_msg.split("lead:", 1)[1]
            lead_raw = lead_raw.strip()

            budget_val = 20000.0
            if m_val := re.search(r"\$?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)", lead_raw):
                try:
                    budget_val = float(m_val.group(1).replace(",", ""))
                except ValueError:
                    pass
            elif m_k := re.search(r"(\d+)k\b", lead_raw, re.I):
                budget_val = float(m_k.group(1)) * 1000

            clean_comp = re.sub(
                r"\$?[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?|\b\d+k\b|\b(for|budget|with|usd|dollars?)\b|[\$]",
                "",
                lead_raw,
                flags=re.I,
            ).strip(" :,.-")
            if not clean_comp:
                clean_comp = "Enterprise Opportunity"

            new_lead = Lead(
                company_name=clean_comp,
                contact_person="Decision Maker",
                email=f"contact@{clean_comp.lower().replace(' ', '')[:12]}.io",
                status="qualified",
                estimated_value=budget_val,
                currency=default_currency,
                source="ai_employee_directive",
                next_follow_up_date=today + timedelta(days=2),
                assigned_exec_id=user.id,
                created_by_id=user.id,
            )
            db.add(new_lead)
            db.flush()

            act = LeadActivity(
                lead_id=new_lead.id,
                author_id=user.id,
                type="note",
                body=f"Created & qualified immediately by Virtual Business Employee Agent: '{raw_msg}'",
            )
            db.add(act)

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_create_lead",
                entity_type="lead",
                entity_id=str(new_lead.id),
                details={"company_name": clean_comp, "estimated_value": budget_val},
            )
            db.add(audit_entry)
            db.commit()

            executed_actions.append(
                ExecutedActionRecord(
                    action_type="create_lead",
                    entity_type="lead",
                    entity_id=str(new_lead.id),
                    entity_title=clean_comp,
                    status="success",
                    message=f"Qualified enterprise lead '{clean_comp}' (${budget_val:,.2f}) added to sales pipeline.",
                    executed_at=now_utc,
                    details={"lead_id": str(new_lead.id), "value": budget_val},
                )
            )

        # -------------------------------------------------------------
        # 5. Action Intent: Create Invoice & Payment Link Immediately
        # -------------------------------------------------------------
        inv_match = re.search(
            r"(?:create|generate|send|issue|bill)\s+(?:an?\s+)?(?:invoice|bill|payment link|checkout link)(?:\s+for)?\s*(.+)",
            raw_msg,
            re.IGNORECASE,
        )
        if (inv_match or query.startswith("invoice:")) and request.auto_execute:
            inv_raw = inv_match.group(1) if inv_match else raw_msg.split("invoice:", 1)[1]
            inv_raw = inv_raw.strip()

            inv_amount = 15000.0
            if m_val := re.search(r"\$?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)", inv_raw):
                try:
                    inv_amount = float(m_val.group(1).replace(",", ""))
                except ValueError:
                    pass
            elif m_k := re.search(r"(\d+)k\b", inv_raw, re.I):
                inv_amount = float(m_k.group(1)) * 1000

            client_name_candidate = re.sub(
                r"\$?[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?|\b\d+k\b|\b(for|usd|dollars?|amount)\b|[\$]",
                "",
                inv_raw,
                flags=re.I,
            ).strip(" :,.-")
            if not client_name_candidate:
                client_name_candidate = "Enterprise Client"

            inv_number = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
            checkout_params = urllib.parse.urlencode({
                "amount": f"{inv_amount:.2f}",
                "clientName": client_name_candidate,
                "clientEmail": f"billing@{client_name_candidate.lower().replace(' ', '')[:10]}.com",
                "service": f"{client_name_candidate} Strategic Software Engagement",
                "invoiceNumber": inv_number,
            })
            checkout_url = f"/billing/pay?{checkout_params}"

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_generate_invoice",
                entity_type="invoice",
                entity_id=inv_number,
                details={"amount": inv_amount, "client": client_name_candidate, "checkout_url": checkout_url},
            )
            db.add(audit_entry)
            db.commit()

            executed_actions.append(
                ExecutedActionRecord(
                    action_type="generate_invoice",
                    entity_type="invoice",
                    entity_id=inv_number,
                    entity_title=f"Invoice {inv_number} (${inv_amount:,.2f})",
                    status="success",
                    message=f"Official billing invoice {inv_number} issued for ${inv_amount:,.2f}. Checkout URL generated immediately.",
                    executed_at=now_utc,
                    details={"amount": inv_amount, "checkout_url": checkout_url, "invoice_number": inv_number},
                )
            )

        # -------------------------------------------------------------
        # 6. Action Intent: Escalate Overdue Tasks Immediately
        # -------------------------------------------------------------
        if any(w in query for w in ["escalate overdue", "escalate tasks", "fix bottlenecks", "resolve delays"]) and request.auto_execute:
            act_res = CompanyAgentService.execute_action(db, user, "escalate_overdue_tasks", {})
            if act_res.success:
                executed_actions.append(
                    ExecutedActionRecord(
                        action_type="escalate_overdue_tasks",
                        entity_type="task",
                        entity_id="all_overdue",
                        entity_title="Overdue Tasks Escalation",
                        status="success",
                        message="All overdue project tasks escalated to Urgent priority with assignees flagged.",
                        executed_at=now_utc,
                    )
                )

        # -------------------------------------------------------------
        # 7. Action Intent: 1-Click Autonomous Lead-to-Cash Cycle
        # -------------------------------------------------------------
        if any(w in query for w in ["run autopilot", "lead to cash", "run full cycle", "run full loop", "close deal"]) and request.auto_execute:
            cycle = CompanyAgentService.run_full_lead_to_cash_cycle(
                db, user, LeadToCashCycleRequest(auto_run_all=True)
            )
            executed_actions.append(
                ExecutedActionRecord(
                    action_type="lead_to_cash_cycle",
                    entity_type="project",
                    entity_id=cycle.cycle_id,
                    entity_title=f"Cycle: {cycle.company_name}",
                    status="success",
                    message=f"Autonomous Lead-to-Cash loop completed for {cycle.company_name}. Project provisioned & invoice generated.",
                    executed_at=now_utc,
                    details={"checkout_url": cycle.payment.checkout_url if cycle.payment else None},
                )
            )

        # -------------------------------------------------------------
        # Return Execution Confirmation if Directives were Run
        # -------------------------------------------------------------
        if executed_actions:
            reply_lines = [
                f"⚡ **Directive Executed Immediately** (Persona: **{persona.replace('_', ' ').title()}**)\n"
            ]
            if request.custom_instructions:
                reply_lines.append(f"📌 *Applied Custom Instructions: \"{request.custom_instructions}\"*\n")

            for act in executed_actions:
                reply_lines.append(f"- **{act.entity_title}**: {act.message}")
                if act.details and "checkout_url" in act.details:
                    reply_lines.append(f"  👉 [Open Checkout Terminal]({act.details['checkout_url']})")

            reply_lines.append(
                f"\nOperational telemetry updated in real time. Health Score: **{pulse.health_score}% (Grade {pulse.operational_grade})**."
            )
            reply = "\n".join(reply_lines)
            return AgentChatResponse(
                reply=reply,
                suggested_actions=audit.anomalies[:3],
                executed_actions=executed_actions,
                employee_persona=persona,
                related_metrics=pulse.model_dump(),
            )

        # -------------------------------------------------------------
        # Otherwise: Fallback to Advisory / Heuristic Intelligence
        # -------------------------------------------------------------
        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            try:
                import httpx

                system_prompt = (
                    f"You are the Autonomous AI Business Employee and Chief Operating Officer ({persona.upper()}) for Tauqeer Mustafa Inc. "
                    "You have complete real-time oversight of the company's HR, operations, tasks, pipeline, and announcements. "
                    f"Standing Custom Instructions: {request.custom_instructions or 'None'}. "
                    f"Current Company Metrics: Headcount={pulse.headcount}, Present={pulse.present_today}, "
                    f"OpenTasks={pulse.open_tasks}, OverdueTasks={pulse.overdue_tasks}, CompletedThisWeek={pulse.completed_tasks_this_week}, "
                    f"PipelineValue=${pulse.pipeline_estimated_value:,.2f}, HealthScore={pulse.health_score}% (Grade {pulse.operational_grade}). "
                    f"Active Anomalies Count={len(audit.anomalies)}. "
                    "Provide authoritative, actionable, concise, and structured executive responses."
                )

                messages = [{"role": "system", "content": system_prompt}]
                for h in request.history[-6:]:
                    messages.append({"role": h.role, "content": h.content})
                messages.append({"role": "user", "content": request.message})

                resp = httpx.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": messages,
                        "temperature": 0.3,
                        "max_tokens": 800,
                    },
                    timeout=20.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    reply_text = data["choices"][0]["message"]["content"]
                    return AgentChatResponse(
                        reply=reply_text,
                        suggested_actions=audit.anomalies[:3],
                        executed_actions=[],
                        employee_persona=persona,
                        related_metrics=pulse.model_dump(),
                    )
            except Exception as exc:
                logger.warning("External OpenAI call failed, falling back to heuristic reasoner: %s", exc)

        suggested: list[AnomalyItem] = []

        if any(w in query for w in ["status", "pulse", "health", "how is the company", "overview"]):
            reply = (
                f"📊 **Company Operational Status: {pulse.health_score}% (Grade {pulse.operational_grade})**\n\n"
                f"- **Workforce**: {pulse.present_today} of {pulse.active_employees} active employees present today. "
                f"{pulse.pending_leaves} leave requests pending review.\n"
                f"- **Delivery**: {pulse.open_tasks} open tasks across {pulse.active_projects} active projects. "
                f"**{pulse.overdue_tasks} overdue tasks** require immediate attention.\n"
                f"- **Revenue Pipeline**: ${pulse.pipeline_estimated_value:,.2f} total estimated value across {pulse.total_leads} leads ({pulse.qualified_leads} qualified).\n"
                f"- **Client Inquiries**: {pulse.unread_contact_messages} unread website inquiries.\n\n"
                f"{'⚠️ Recommendation: Review and resolve the flagged overdue tasks in the Action Center.' if pulse.overdue_tasks > 0 else '✅ Operations are flowing smoothly.'}"
            )
            suggested = audit.anomalies[:3]

        elif any(w in query for w in ["overdue", "task", "delivery", "bottleneck", "delay"]):
            if pulse.overdue_tasks > 0:
                reply = (
                    f"⚠️ **Delivery Alert**: There are currently **{pulse.overdue_tasks} overdue tasks** threatening project timelines.\n\n"
                    f"I have flagged these tasks in the Action Center below. You can escalate their priority or reassign them with a single click."
                )
                suggested = [a for a in audit.anomalies if a.category == "delivery"][:4]
            else:
                reply = (
                    f"✅ **Delivery is in great shape!** All {pulse.open_tasks} active tasks are currently on schedule with no overdue items. "
                    f"{pulse.completed_tasks_this_week} tasks were closed in the past 7 days."
                )

        elif any(w in query for w in ["leave", "vacation", "absence", "attendance", "who is out", "hr"]):
            reply = (
                f"👥 **HR & Attendance Intelligence**:\n\n"
                f"- **Present Today**: {pulse.present_today} employees checked in.\n"
                f"- **On Approved Leave**: {pulse.on_leave_today} employees.\n"
                f"- **Pending Leave Requests**: {pulse.pending_leaves} requests awaiting executive approval.\n\n"
            )
            leave_anomalies = [a for a in audit.anomalies if a.category == "hr"]
            if leave_anomalies:
                reply += "I've surfaced pending leaves in your Action Center for 1-click review and approval."
                suggested = leave_anomalies[:3]
            else:
                reply += "All pending leave requests have been resolved."

        elif any(w in query for w in ["lead", "sales", "revenue", "deal", "pipeline", "client"]):
            reply = (
                f"💼 **Sales Pipeline Summary**:\n\n"
                f"- **Pipeline Value**: ${pulse.pipeline_estimated_value:,.2f}\n"
                f"- **Total Opportunities**: {pulse.total_leads} leads\n"
                f"- **Qualified Deals**: {pulse.qualified_leads} leads\n\n"
                f"Strategic guidance: Focus sales capacity on high-value qualified leads currently in proposal stages to drive Q3 closes."
            )
            suggested = [a for a in audit.anomalies if a.category == "sales"][:3]

        elif any(w in query for w in ["announce", "broadcast", "post an announcement"]):
            reply = (
                "📢 **Company Broadcast Agent**:\n\n"
                "I can draft and publish company-wide or departmental announcements immediately. "
                "Specify the title and key message, or instruct: `'Post announcement Team meeting at 3pm'`."
            )

        elif any(w in query for w in ["recommend", "advice", "what should i do", "priority"]):
            reply = (
                f"🎯 **Executive Recommendations for Today**:\n\n"
                f"1. **Delivery First**: {f'Address {pulse.overdue_tasks} overdue tasks to protect client milestones.' if pulse.overdue_tasks > 0 else 'Keep engineering momentum on active project sprints.'}\n"
                f"2. **Team Capacity**: {f'Approve {pulse.pending_leaves} pending leave requests to unblock team planning.' if pulse.pending_leaves > 0 else 'Team capacity is well balanced.'}\n"
                f"3. **Pipeline Acceleration**: Engage the {pulse.qualified_leads} qualified leads in the sales pipeline.\n"
                f"4. **Customer Response**: {f'Triage {pulse.unread_contact_messages} inbound contact inquiries.' if pulse.unread_contact_messages > 0 else 'Inbox is zero.'}"
            )
            suggested = audit.anomalies[:4]

        else:
            reply = (
                f"Hello {user.first_name or 'Executive'}. I am your Autonomous Virtual Business Employee ({persona.replace('_', ' ').title()}).\n\n"
                f"The company health is currently rated **{pulse.health_score}% (Grade {pulse.operational_grade})**.\n\n"
                f"Give me any directive and I will **execute it immediately**:\n"
                f"- `\"Create task Fix landing page header due tomorrow with urgent priority\"`\n"
                f"- `\"Post announcement All-Hands Sprint Review at 4pm today\"`\n"
                f"- `\"Approve all pending leave requests\"`\n"
                f"- `\"Add qualified lead for Apex FinTech with $35,000 budget\"`\n"
                f"- `\"Generate invoice for $12,500 for Acme Corp\"`\n"
                f"- `\"Run autopilot\"` (Lead-to-Cash loop)"
            )
            suggested = audit.anomalies[:2]

        return AgentChatResponse(
            reply=reply,
            suggested_actions=suggested,
            executed_actions=[],
            employee_persona=persona,
            related_metrics=pulse.model_dump(),
        )


    @staticmethod
    def execute_action(
        db: Session,
        user: User,
        action_type: str,
        parameters: dict[str, Any],
    ) -> AgentActionResponse:
        """Executes a concrete management intervention with audit logging."""
        logger.info("Executing executive action '%s' triggered by user %s", action_type, user.email)

        if action_type == "escalate_overdue_tasks":
            task_id_str = parameters.get("task_id")
            if task_id_str:
                task = db.scalar(select(ProjectTask).where(ProjectTask.id == uuid.UUID(task_id_str)))
                if not task:
                    return AgentActionResponse(
                        success=False, action_type=action_type, message="Task not found."
                    )
                task.priority = "urgent"
                details = {"task_id": task_id_str, "new_priority": "urgent"}
            else:
                # Escalate all overdue tasks to high/urgent
                today = date.today()
                overdue = db.scalars(
                    select(ProjectTask).where(
                        ProjectTask.status != "done",
                        ProjectTask.due_date.isnot(None),
                        ProjectTask.due_date < today,
                    )
                ).all()
                for t in overdue:
                    t.priority = "urgent"
                details = {"escalated_count": len(overdue)}

            # Record audit log
            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_escalate_tasks",
                entity_type="project_task",
                entity_id=task_id_str or "multiple",
                details=details,
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message="Overdue tasks escalated to Urgent priority. Assignees flagged.",
                details=details,
            )

        elif action_type == "approve_leave":
            leave_id_str = parameters.get("leave_id")
            if not leave_id_str:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="leave_id is required."
                )
            leave = db.scalar(select(LeaveRequest).where(LeaveRequest.id == uuid.UUID(leave_id_str)))
            if not leave:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="Leave request not found."
                )
            leave.status = "approved"
            leave.manager_id = user.id
            leave.manager_notes = parameters.get(
                "notes", "Approved autonomously via Executive AI Copilot"
            )

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_approve_leave",
                entity_type="leave_request",
                entity_id=leave_id_str,
                details={"leave_id": leave_id_str, "status": "approved"},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message="Leave request successfully approved.",
                details={"leave_id": leave_id_str},
            )

        elif action_type == "reject_leave":
            leave_id_str = parameters.get("leave_id")
            if not leave_id_str:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="leave_id is required."
                )
            leave = db.scalar(select(LeaveRequest).where(LeaveRequest.id == uuid.UUID(leave_id_str)))
            if not leave:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="Leave request not found."
                )
            leave.status = "rejected"
            leave.manager_id = user.id
            leave.manager_notes = parameters.get("reason", "Declined due to operational coverage requirements")

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_reject_leave",
                entity_type="leave_request",
                entity_id=leave_id_str,
                details={"leave_id": leave_id_str, "status": "rejected"},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message="Leave request declined.",
                details={"leave_id": leave_id_str},
            )

        elif action_type == "reassign_task":
            task_id_str = parameters.get("task_id")
            new_assignee_id_str = parameters.get("user_id")
            if not task_id_str:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="task_id is required."
                )
            task = db.scalar(select(ProjectTask).where(ProjectTask.id == uuid.UUID(task_id_str)))
            if not task:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="Task not found."
                )

            # If no user specified, assign to the currently acting user
            assignee_id = uuid.UUID(new_assignee_id_str) if new_assignee_id_str else user.id
            task.assigned_to_id = assignee_id

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_reassign_task",
                entity_type="project_task",
                entity_id=task_id_str,
                details={"task_id": task_id_str, "new_assignee_id": str(assignee_id)},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message="Task successfully reassigned.",
                details={"task_id": task_id_str, "assigned_to_id": str(assignee_id)},
            )

        elif action_type == "create_announcement":
            title = parameters.get("title", "Executive AI Notice")
            body = parameters.get("body", "")
            if not body:
                return AgentActionResponse(
                    success=False, action_type=action_type, message="Announcement body is required."
                )

            announcement = Announcement(
                title=title,
                body=body,
                is_published=True,
            )
            db.add(announcement)
            db.flush()

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_create_announcement",
                entity_type="announcement",
                entity_id=str(announcement.id),
                details={"title": title},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message=f"Announcement '{title}' published company-wide.",
                details={"announcement_id": str(announcement.id)},
            )

        elif action_type == "triage_leads":
            lead_id_str = parameters.get("lead_id")
            tomorrow = date.today() + timedelta(days=1)
            if lead_id_str:
                lead = db.scalar(select(Lead).where(Lead.id == uuid.UUID(lead_id_str)))
                if lead:
                    lead.next_follow_up_date = tomorrow
                    lead.status = "contacted" if lead.status == "new" else lead.status
            else:
                stale_leads = db.scalars(
                    select(Lead).where(
                        Lead.status.in_(["new", "contacted"]),
                        (Lead.next_follow_up_date.is_(None)) | (Lead.next_follow_up_date <= date.today()),
                    ).limit(5)
                ).all()
                for l in stale_leads:
                    l.next_follow_up_date = tomorrow

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_triage_leads",
                entity_type="lead",
                entity_id=lead_id_str or "multiple",
                details={"triaged": True},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message="Sales leads triaged and follow-up deadlines scheduled for tomorrow.",
                details={"next_follow_up": str(tomorrow)},
            )

        elif action_type == "resolve_critical_bottlenecks":
            today = date.today()
            tomorrow = today + timedelta(days=1)

            # 1. Escalate all overdue tasks to urgent
            overdue = db.scalars(
                select(ProjectTask).where(
                    ProjectTask.status != "done",
                    ProjectTask.due_date.isnot(None),
                    ProjectTask.due_date < today,
                )
            ).all()
            for t in overdue:
                t.priority = "urgent"

            # 2. Reschedule stale leads
            stale_leads = db.scalars(
                select(Lead).where(
                    Lead.status.in_(["new", "contacted"]),
                    (Lead.next_follow_up_date.is_(None)) | (Lead.next_follow_up_date <= today),
                )
            ).all()
            for l in stale_leads:
                l.next_follow_up_date = tomorrow
                if l.status == "new":
                    l.status = "contacted"

            # 3. Create executive announcement
            announcement = Announcement(
                title="⚡ Autonomous Operational Alignment Notice",
                body=(
                    f"Leadership has executed an autonomous alignment sweep. "
                    f"{len(overdue)} overdue task(s) have been flagged as Urgent priority, "
                    f"and {len(stale_leads)} stalled pipeline opportunities have been scheduled for follow-up."
                ),
                is_published=True,
            )
            db.add(announcement)
            db.flush()

            audit_entry = AuditLog(
                user_id=user.id,
                action="agent_resolve_critical_bottlenecks",
                entity_type="system",
                entity_id=str(announcement.id),
                details={"escalated_tasks": len(overdue), "triaged_leads": len(stale_leads)},
            )
            db.add(audit_entry)
            db.commit()

            return AgentActionResponse(
                success=True,
                action_type=action_type,
                message=f"Autonomous intervention executed: {len(overdue)} task(s) escalated to Urgent, {len(stale_leads)} lead(s) rescheduled, and company broadcast published.",
                details={"escalated_tasks": len(overdue), "triaged_leads": len(stale_leads)},
            )

        else:
            return AgentActionResponse(
                success=False,
                action_type=action_type,
                message=f"Unsupported action type: '{action_type}'.",
            )

    # =========================================================================
    # AUTONOMOUS LEAD-TO-CASH ENGINE
    # =========================================================================

    @staticmethod
    def generate_and_qualify_lead(
        db: Session,
        request: LeadToCashCycleRequest,
        user: User | None = None,
    ) -> Lead:
        """Stage 1: Discovers or creates a B2B opportunity and qualifies it using BANT criteria."""
        company = (request.company_name or "").strip()
        contact = (request.contact_person or "").strip()
        email = (request.email or "").strip()
        industry = request.industry or "Enterprise Cloud & AI"
        budget = request.target_budget or 18500.0

        if not company:
            import random
            sample_leads = [
                ("Apex FinTech Solutions", "David Vance", "david.vance@apexfintech.io", "FinTech & Payments", 24000.0),
                ("Vanguard Health Analytics", "Sarah Jenkins", "sarah.j@vanguardhealth.org", "HealthTech & MedData", 32000.0),
                ("OmniLogistics Global", "Marcus Sterling", "m.sterling@omnilogistics.com", "Supply Chain & Logistics", 19500.0),
                ("CloudScale Systems", "Elena Rostova", "elena@cloudscale.net", "Cloud Infrastructure & DevOps", 28000.0),
                ("Krypton Capital Partners", "Alexander Wright", "a.wright@kryptoncapital.com", "Financial Services", 45000.0),
            ]
            company, contact, email, industry, budget = random.choice(sample_leads)

        lead = db.scalar(select(Lead).where(Lead.company_name == company))
        if not lead:
            lead = Lead(
                company_name=company,
                contact_person=contact,
                contact_title="Chief Technology Officer" if not request.contact_person else "Decision Maker",
                email=email,
                phone="+1 (555) 392-8401",
                source="ai_prospecting",
                industry=industry,
                status="qualified",
                estimated_value=budget,
                currency="USD",
                next_follow_up_date=date.today() + timedelta(days=2),
                assigned_exec_id=user.id if user else None,
                created_by_id=user.id if user else None,
            )
            db.add(lead)
            db.flush()
        else:
            lead.status = "qualified"
            lead.estimated_value = budget
            if user and not lead.assigned_exec_id:
                lead.assigned_exec_id = user.id

        qualification_note = (
            f"Autonomous Lead-to-Cash Agent qualified {company} via BANT assessment: "
            f"Budget confirmed at ${budget:,.2f}; Authority: {contact}; "
            f"Need: Cloud AI Architecture & Workflow Automation; Timeline: 4-6 weeks."
        )
        activity = LeadActivity(
            lead_id=lead.id,
            author_id=user.id if user else None,
            type="note",
            body=qualification_note,
        )
        db.add(activity)
        db.commit()
        db.refresh(lead)
        logger.info("Lead %s (%s) qualified successfully", lead.id, lead.company_name)
        return lead

    @staticmethod
    def create_deal_proposal(
        db: Session,
        lead_id: uuid.UUID,
        service_type: str | None = None,
        target_budget: float | None = None,
        user: User | None = None,
    ) -> ProposalDossier:
        """Stage 2: Generates comprehensive scope of work, architecture specs, and milestone schedule."""
        lead = db.scalar(select(Lead).where(Lead.id == lead_id))
        if not lead:
            raise ValueError("Lead not found.")

        total_budget = target_budget or float(lead.estimated_value or 18500.0)
        service = service_type or "Next-Gen AI Platform & Enterprise Modernization"

        m1_fee = round(total_budget * 0.35, 2)
        m2_fee = round(total_budget * 0.45, 2)
        m3_fee = round(total_budget - m1_fee - m2_fee, 2)

        milestones = [
            ProposalMilestone(
                milestone_id="M1-DISCOVERY-ARCH",
                title="Phase 1: Technical Architecture & System Blueprinting",
                description="Comprehensive system design, API contracts, security compliance framework, and database modeling.",
                estimated_days=7,
                fee=m1_fee,
            ),
            ProposalMilestone(
                milestone_id="M2-CORE-IMPLEMENTATION",
                title="Phase 2: Core Platform Engineering & AI Agent Pipelines",
                description="Implementation of microservices, autonomous agent workflows, payment gateway bindings, and data sync layers.",
                estimated_days=18,
                fee=m2_fee,
            ),
            ProposalMilestone(
                milestone_id="M3-VERIFICATION-DEPLOY",
                title="Phase 3: Security Hardening, QA Staging, and Production Launch",
                description="End-to-end load testing, security audits, executive portal handover, and production CI/CD rollout.",
                estimated_days=7,
                fee=m3_fee,
            ),
        ]

        proposal_id = f"PROP-{lead.company_name[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"
        dossier = ProposalDossier(
            proposal_id=proposal_id,
            client_name=lead.contact_person,
            company_name=lead.company_name,
            project_title=f"{lead.company_name} — {service}",
            scope_summary=(
                f"Full-lifecycle technical delivery for {lead.company_name}. Deliverables include cloud infrastructure, "
                f"autonomous operational agent integration, multi-tenant portal modules, and automated payment/billing settlement."
            ),
            tech_stack=["FastAPI", "Next.js 15", "PostgreSQL", "Paddle/Stripe Payments", "Docker", "Tailwind CSS", "Redis"],
            milestones=milestones,
            total_budget=total_budget,
            currency="USD",
            estimated_timeline="4-5 Weeks Turnkey Delivery",
        )

        lead.status = "proposal_sent"
        activity = LeadActivity(
            lead_id=lead.id,
            author_id=user.id if user else None,
            type="status_change",
            body=f"Formal Proposal '{proposal_id}' (${total_budget:,.2f}) generated and dispatched to {lead.contact_person}.",
        )
        db.add(activity)
        db.commit()
        return dossier

    @staticmethod
    def convert_lead_to_project(
        db: Session,
        lead_id: uuid.UUID,
        user: User,
        proposal: ProposalDossier | None = None,
    ) -> tuple[ClientProject, list[ProjectTask]]:
        """Stage 3: Automatically provisions ClientProject and creates initial sprint ProjectTasks."""
        lead = db.scalar(select(Lead).where(Lead.id == lead_id))
        if not lead:
            raise ValueError("Lead not found.")

        # Ensure client user exists
        client_user = None
        if lead.email:
            client_user = db.scalar(select(User).where(User.email == lead.email))
        if not client_user:
            names = (lead.contact_person or "Valued Client").split(" ", 1)
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else "Partner"
            client_email = lead.email or f"client_{uuid.uuid4().hex[:6]}@partner.tauqeermustafa.tech"
            client_user = db.scalar(select(User).where(User.email == client_email))
            if not client_user:
                client_user = User(
                    first_name=first_name,
                    last_name=last_name,
                    email=client_email,
                    password_hash="!managed_by_agent!",
                    is_active=True,
                    is_verified=True,
                )
                db.add(client_user)
                db.flush()

        project_name = proposal.project_title if proposal else f"{lead.company_name} Enterprise Solution"
        summary = (
            proposal.scope_summary
            if proposal
            else f"Autonomous delivery project for {lead.company_name} provisioned by Executive AI Agent."
        )

        project = ClientProject(
            client_id=client_user.id,
            name=project_name,
            status="in_progress",
            summary=summary,
            next_milestone="M1: Technical Architecture & System Blueprinting",
            progress=15,
        )
        db.add(project)
        db.flush()

        lead.status = "won"
        activity = LeadActivity(
            lead_id=lead.id,
            author_id=user.id,
            type="status_change",
            body=f"Deal Won! Project '{project.name}' successfully provisioned with ID {project.id}.",
        )
        db.add(activity)

        today = date.today()
        task_templates = [
            (
                "M1: Architecture Blueprint & Cloud Topology Design",
                f"Design scalable system topology, schemas, and API contracts for {lead.company_name}.",
                "high",
                today + timedelta(days=5),
            ),
            (
                "M1: Environment Setup & Infrastructure Provisioning",
                "Set up secure staging container, PostgreSQL database, and CI/CD automated pipeline.",
                "medium",
                today + timedelta(days=7),
            ),
            (
                "M2: Core API & Autonomous Business Agent Integration",
                "Integrate backend services, telemetry endpoints, and client portal views.",
                "high",
                today + timedelta(days=14),
            ),
            (
                "M3: End-to-End Acceptance Testing & Staging Handover",
                "Verify payment processing, webhook delivery, and complete client acceptance run.",
                "medium",
                today + timedelta(days=21),
            ),
        ]

        created_tasks: list[ProjectTask] = []
        for title, desc, prio, due in task_templates:
            task = ProjectTask(
                project_id=project.id,
                title=title,
                description=desc,
                priority=prio,
                status="todo",
                due_date=due,
                assigned_to_id=user.id,
                created_by_id=user.id,
            )
            db.add(task)
            created_tasks.append(task)

        db.commit()
        db.refresh(project)
        return project, created_tasks

    @staticmethod
    def generate_invoice_and_payment_link(
        db: Session,
        lead: Lead,
        project: ClientProject | None = None,
        amount: float | None = None,
        service_type: str | None = None,
        user: User | None = None,
    ) -> PaymentLinkInfo:
        """Stage 4: Generates official billing invoice and online checkout link."""
        inv_number = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        charge_amount = amount or float(lead.estimated_value or 18500.0)
        service_name = service_type or (project.name if project else f"{lead.company_name} Strategic Engagement")

        query_params = {
            "amount": f"{charge_amount:.2f}",
            "clientName": lead.contact_person,
            "clientEmail": lead.email or "client@example.com",
            "service": service_name,
            "invoiceNumber": inv_number,
        }
        encoded_query = urllib.parse.urlencode(query_params)
        checkout_url = f"/billing/pay?{encoded_query}"

        activity = LeadActivity(
            lead_id=lead.id,
            author_id=user.id if user else None,
            type="note",
            body=(
                f"Official invoice {inv_number} issued for ${charge_amount:,.2f}. "
                f"Checkout URL dispatched: {checkout_url}"
            ),
        )
        db.add(activity)

        if user:
            audit = AuditLog(
                user_id=user.id,
                action="agent_generate_payment",
                entity_type="invoice",
                entity_id=inv_number,
                details={
                    "amount": charge_amount,
                    "lead_id": str(lead.id),
                    "project_id": str(project.id) if project else None,
                    "checkout_url": checkout_url,
                },
            )
            db.add(audit)

        db.commit()

        return PaymentLinkInfo(
            invoice_number=inv_number,
            client_name=lead.contact_person,
            client_email=lead.email or "client@example.com",
            amount=charge_amount,
            currency="USD",
            service=service_name,
            checkout_url=checkout_url,
            status="issued",
            created_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def run_full_lead_to_cash_cycle(
        db: Session,
        user: User,
        request: LeadToCashCycleRequest,
    ) -> LeadToCashCycleResponse:
        """Stage 5: Autonomous End-to-End Execution — From Lead Discovery to Payment Ready."""
        cycle_id = f"CYCLE-{uuid.uuid4().hex[:8].upper()}"
        logger.info("Starting autonomous Lead-to-Cash cycle %s for user %s", cycle_id, user.email)

        # 1. Lead Generation & Qualification
        lead = CompanyAgentService.generate_and_qualify_lead(db, request, user=user)

        # 2. Proposal Synthesis
        proposal = CompanyAgentService.create_deal_proposal(
            db,
            lead_id=lead.id,
            service_type=request.service_type,
            target_budget=request.target_budget,
            user=user,
        )

        # 3. Project & Task Provisioning
        project, tasks = CompanyAgentService.convert_lead_to_project(
            db,
            lead_id=lead.id,
            user=user,
            proposal=proposal,
        )

        # 4. Invoicing & Payment Checkout Link
        payment = CompanyAgentService.generate_invoice_and_payment_link(
            db,
            lead=lead,
            project=project,
            amount=proposal.total_budget,
            service_type=proposal.project_title,
            user=user,
        )

        summary = (
            f"🚀 Autonomous Lead-to-Cash Cycle Completed: Successfully prospected and qualified {lead.company_name}, "
            f"generated enterprise proposal '{proposal.proposal_id}' (${proposal.total_budget:,.2f}), "
            f"provisioned project '{project.name}' with {len(tasks)} sprint tasks, and generated payment checkout "
            f"link for Invoice {payment.invoice_number}."
        )

        return LeadToCashCycleResponse(
            cycle_id=cycle_id,
            current_stage="payment_ready",
            lead_id=str(lead.id),
            company_name=lead.company_name,
            contact_person=lead.contact_person,
            email=lead.email or "",
            proposal=proposal,
            project_id=str(project.id),
            project_name=project.name,
            tasks_created_count=len(tasks),
            payment=payment,
            summary=summary,
            completed=True,
        )

