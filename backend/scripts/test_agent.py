"""Automated verification test for the Company Executive AI Agent Service."""
import sys
import uuid
from datetime import date, datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "TEXT"


from app.db.base import Base
from app.models.announcement import Announcement
from app.models.attendance import Attendance
from app.models.audit_log import AuditLog
from app.models.contact_message import ContactMessage
from app.models.department import Department
from app.models.employee import Employee
from app.models.lead import Lead
from app.models.leave import LeaveRequest
from app.models.portal import ClientProject
from app.models.role import Role
from app.models.task import ProjectTask, task_assignees
from app.models.user import User
from app.schemas.agent import AgentChatRequest
from app.services.company_agent import CompanyAgentService


def run_tests():
    print("--- 1. Setting up in-memory test database ---")
    engine = create_engine("sqlite:///:memory:")
    target_tables = [
        Role.__table__,
        User.__table__,
        Department.__table__,
        Employee.__table__,
        Attendance.__table__,
        ClientProject.__table__,
        ProjectTask.__table__,
        task_assignees,
        LeaveRequest.__table__,
        Lead.__table__,
        ContactMessage.__table__,
        Announcement.__table__,
        AuditLog.__table__,
    ]
    Base.metadata.create_all(bind=engine, tables=target_tables)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("--- 2. Seeding test company data ---")
    # Roles
    admin_role = Role(id=uuid.uuid4(), name="Admin", slug="admin", hierarchy_level=100)
    member_role = Role(id=uuid.uuid4(), name="Member", slug="member", hierarchy_level=10)
    session.add_all([admin_role, member_role])
    session.flush()

    # Users
    ceo_user = User(
        id=uuid.uuid4(),
        email="ceo@tauqeermustafa.tech",
        password_hash="hash",
        first_name="Tauqeer",
        last_name="Mustafa",
        role_id=admin_role.id,
        is_active=True,
    )
    dev_user = User(
        id=uuid.uuid4(),
        email="dev@tauqeermustafa.tech",
        password_hash="hash",
        first_name="Ahmed",
        last_name="Khan",
        role_id=member_role.id,
        is_active=True,
    )
    session.add_all([ceo_user, dev_user])
    session.flush()

    # Department & Employees
    tech_dept = Department(id=uuid.uuid4(), name="Technology")
    session.add(tech_dept)
    session.flush()

    emp1 = Employee(
        id=uuid.uuid4(),
        user_id=ceo_user.id,
        department_id=tech_dept.id,
        job_title="CEO",
        status="active",
    )
    emp2 = Employee(
        id=uuid.uuid4(),
        user_id=dev_user.id,
        department_id=tech_dept.id,
        job_title="Senior Engineer",
        status="active",
    )
    session.add_all([emp1, emp2])
    session.flush()

    # Attendance today
    today = date.today()
    att1 = Attendance(
        id=uuid.uuid4(),
        employee_id=emp1.id,
        date=today,
        status="present",
        check_in_time=datetime.now(timezone.utc),
    )
    session.add(att1)

    # Overdue Task
    yesterday = today - timedelta(days=2)
    overdue_task = ProjectTask(
        id=uuid.uuid4(),
        title="Deploy Critical Production Patch",
        status="in_progress",
        priority="high",
        due_date=yesterday,
        assigned_to_id=dev_user.id,
        created_by_id=ceo_user.id,
    )
    session.add(overdue_task)

    # Pending Leave Request
    leave_req = LeaveRequest(
        id=uuid.uuid4(),
        employee_id=emp2.id,
        start_date=today + timedelta(days=3),
        end_date=today + timedelta(days=5),
        leave_type="vacation",
        reason="Family event",
        status="pending",
    )
    session.add(leave_req)

    # Sales Lead
    lead1 = Lead(
        id=uuid.uuid4(),
        company_name="Acme Corp",
        contact_person="John Doe",
        email="john@acme.com",
        status="qualified",
        estimated_value=15000.0,
        currency="USD",
        next_follow_up_date=today - timedelta(days=1),
    )
    session.add(lead1)

    # Contact Message
    msg1 = ContactMessage(
        id=uuid.uuid4(),
        name="Sarah Connor",
        email="sarah@skynet.com",
        company="Cyberdyne Systems",
        message="We need company management AI services.",
        is_read=False,
    )
    session.add(msg1)

    session.commit()
    print("Seed complete.")

    print("\n--- 3. Testing CompanyAgentService.get_company_pulse() ---")
    pulse = CompanyAgentService.get_company_pulse(session)
    print(f"Pulse: Health={pulse.health_score}%, Grade={pulse.operational_grade}")
    print(f"Metrics: Headcount={pulse.headcount}, OverdueTasks={pulse.overdue_tasks}, PipelineValue=${pulse.pipeline_estimated_value}")
    print(f"Departments: {[d.name for d in pulse.departments]}")
    assert pulse.headcount == 2, f"Expected headcount 2, got {pulse.headcount}"
    assert pulse.overdue_tasks == 1, f"Expected 1 overdue task, got {pulse.overdue_tasks}"
    assert pulse.pending_leaves == 1, f"Expected 1 pending leave, got {pulse.pending_leaves}"
    assert pulse.pipeline_estimated_value == 15000.0, f"Expected 15000.0 pipeline value, got {pulse.pipeline_estimated_value}"
    assert len(pulse.departments) >= 1, "Expected at least 1 department"
    print(">>> PASS: get_company_pulse()")

    print("\n--- 4. Testing CompanyAgentService.run_autonomous_audit() ---")
    audit = CompanyAgentService.run_autonomous_audit(session)
    print(f"Audit: {audit.anomalies_count} anomalies detected, {audit.critical_count} critical.")
    print(f"Executive Summary: {audit.executive_summary}")
    assert audit.anomalies_count >= 3, f"Expected at least 3 anomalies, got {audit.anomalies_count}"
    print(">>> PASS: run_autonomous_audit()")

    print("\n--- 5. Testing CompanyAgentService.generate_executive_briefing() ---")
    briefing = CompanyAgentService.generate_executive_briefing(session)
    print(f"Briefing Headline: {briefing.headline}")
    print(f"Audio Summary: {briefing.audio_summary}")
    print(f"Achievements: {len(briefing.top_achievements)}, Risks: {len(briefing.critical_risks)}, Recs: {len(briefing.strategic_recommendations)}")
    assert len(briefing.top_achievements) > 0
    assert len(briefing.critical_risks) > 0
    assert len(briefing.audio_summary) > 20
    print(">>> PASS: generate_executive_briefing()")

    print("\n--- 6. Testing CompanyAgentService.process_agent_command() (Copilot Chat) ---")
    chat_resp = CompanyAgentService.process_agent_command(
        session, ceo_user, AgentChatRequest(message="What tasks are overdue?")
    )
    print(f"AI Reply:\n{chat_resp.reply}")
    assert "overdue" in chat_resp.reply.lower() or "task" in chat_resp.reply.lower()
    print(">>> PASS: process_agent_command()")

    print("\n--- 7. Testing CompanyAgentService.execute_action() ---")
    # Test 1: Escalate overdue task
    act_resp = CompanyAgentService.execute_action(
        session, ceo_user, "escalate_overdue_tasks", {"task_id": str(overdue_task.id)}
    )
    print(f"Escalate Action: success={act_resp.success}, msg={act_resp.message}")
    assert act_resp.success
    assert overdue_task.priority == "urgent"

    # Test 2: Approve leave
    act_resp2 = CompanyAgentService.execute_action(
        session, ceo_user, "approve_leave", {"leave_id": str(leave_req.id)}
    )
    print(f"Approve Leave Action: success={act_resp2.success}, msg={act_resp2.message}")
    assert act_resp2.success
    assert leave_req.status == "approved"

    # Test 3: Create Announcement
    act_resp3 = CompanyAgentService.execute_action(
        session,
        ceo_user,
        "create_announcement",
        {"title": "Q3 Launch Goals", "body": "All teams please review the Q3 goals."},
    )
    print(f"Create Announcement Action: success={act_resp3.success}, msg={act_resp3.message}")
    assert act_resp3.success

    # Test 4: Batch resolve critical bottlenecks
    act_resp4 = CompanyAgentService.execute_action(
        session,
        ceo_user,
        "resolve_critical_bottlenecks",
        {},
    )
    print(f"Batch Action: success={act_resp4.success}, msg={act_resp4.message}")
    assert act_resp4.success

    # Verify audit log
    audit_logs = session.query(AuditLog).all()
    print(f"Audit log entries recorded: {len(audit_logs)}")
    assert len(audit_logs) == 4
    print(">>> PASS: execute_action()")

    print("\n=======================================================")
    print(" ALL AI COMPANY AGENT VERIFICATION TESTS PASSED (100%) ")
    print("=======================================================")


if __name__ == "__main__":
    run_tests()
