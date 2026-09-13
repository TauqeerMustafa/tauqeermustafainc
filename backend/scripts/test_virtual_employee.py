"""Verification test for the Autonomous Virtual Business Employee Agent."""
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
from app.models.lead import Lead, LeadActivity
from app.models.leave import LeaveRequest
from app.models.portal import ClientProject
from app.models.role import Role
from app.models.task import ProjectTask, task_assignees
from app.models.user import User
from app.schemas.agent import AgentChatRequest
from app.services.company_agent import CompanyAgentService


def test_virtual_employee():
    print("=== 1. Initializing In-Memory Engine ===")
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
        LeadActivity.__table__,
        ContactMessage.__table__,
        Announcement.__table__,
        AuditLog.__table__,
    ]
    Base.metadata.create_all(bind=engine, tables=target_tables)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("=== 2. Creating Executive User ===")
    exec_user = User(
        id=uuid.uuid4(),
        first_name="Tauqeer",
        last_name="Mustafa",
        email="tauqeer@tauqeermustafa.com",
        password_hash="hashed_pw",
        is_superuser=True,
        is_active=True,
        is_verified=True,
    )
    session.add(exec_user)
    session.commit()

    print("=== 3. Testing Directive: Immediate Task Creation ===")
    chat_req1 = AgentChatRequest(
        message="Create task Setup Paddle Payment Webhooks with urgent priority due tomorrow",
        employee_persona="project_manager",
        auto_execute=True,
    )
    resp1 = CompanyAgentService.process_agent_command(session, exec_user, chat_req1)
    assert len(resp1.executed_actions) == 1, f"Expected 1 executed action, got {len(resp1.executed_actions)}"
    act1 = resp1.executed_actions[0]
    assert act1.action_type == "create_task"
    assert "Paddle Payment Webhooks" in act1.entity_title

    # Verify task in DB
    created_task = session.scalar(select(ProjectTask).where(ProjectTask.id == uuid.UUID(act1.entity_id)))
    assert created_task is not None
    assert created_task.priority == "urgent"
    assert created_task.due_date == date.today() + timedelta(days=1)
    print(f"  [PASS] Task created immediately in DB: '{created_task.title}' (Priority: {created_task.priority}, Due: {created_task.due_date})")

    print("=== 4. Testing Directive: Custom Instructions Priority Override ===")
    chat_req2 = AgentChatRequest(
        message="Create task Review Client System Architecture",
        custom_instructions="Always set task priority to high",
        employee_persona="universal",
        auto_execute=True,
    )
    resp2 = CompanyAgentService.process_agent_command(session, exec_user, chat_req2)
    assert len(resp2.executed_actions) == 1
    act2 = resp2.executed_actions[0]
    created_task2 = session.scalar(select(ProjectTask).where(ProjectTask.id == uuid.UUID(act2.entity_id)))
    assert created_task2.priority == "high", f"Expected high priority from custom instructions, got {created_task2.priority}"
    print(f"  [PASS] Custom instruction honored: Task priority set to '{created_task2.priority}'")

    print("=== 5. Testing Directive: Immediate Company Announcement Publication ===")
    chat_req3 = AgentChatRequest(
        message="Post announcement Q4 Town Hall: All engineers and managers please join the keynote tomorrow at 3pm.",
        auto_execute=True,
    )
    resp3 = CompanyAgentService.process_agent_command(session, exec_user, chat_req3)
    assert len(resp3.executed_actions) == 1
    act3 = resp3.executed_actions[0]
    assert act3.action_type == "create_announcement"
    created_anno = session.scalar(select(Announcement).where(Announcement.id == uuid.UUID(act3.entity_id)))
    assert created_anno is not None
    assert created_anno.is_published is True
    print(f"  [PASS] Announcement published company-wide: '{created_anno.title}'")

    print("=== 6. Testing Directive: Immediate Leave Approval ===")
    dept = Department(name="Engineering")
    session.add(dept)
    session.flush()
    emp = Employee(
        user_id=exec_user.id,
        department_id=dept.id,
        job_title="Lead Architect",
        joining_date=date.today() - timedelta(days=200),
        status="active",
    )
    session.add(emp)
    session.flush()

    leave = LeaveRequest(
        id=uuid.uuid4(),
        employee_id=emp.id,
        leave_type="annual",
        start_date=date.today() + timedelta(days=2),
        end_date=date.today() + timedelta(days=5),
        reason="Family vacation",
        status="pending",
    )
    session.add(leave)
    session.commit()

    chat_req4 = AgentChatRequest(
        message="Approve all pending leave requests immediately",
        auto_execute=True,
    )
    resp4 = CompanyAgentService.process_agent_command(session, exec_user, chat_req4)
    assert len(resp4.executed_actions) == 1
    session.refresh(leave)
    assert leave.status == "approved"
    print(f"  [PASS] Leave request approved immediately: ID {leave.id} (Status: {leave.status})")

    print("=== 7. Testing Directive: Immediate Lead Creation in Sales Pipeline ===")
    chat_req5 = AgentChatRequest(
        message="Add qualified lead for HyperScale Cloud with $38,000 budget",
        auto_execute=True,
    )
    resp5 = CompanyAgentService.process_agent_command(session, exec_user, chat_req5)
    assert len(resp5.executed_actions) == 1
    act5 = resp5.executed_actions[0]
    created_lead = session.scalar(select(Lead).where(Lead.id == uuid.UUID(act5.entity_id)))
    assert created_lead is not None
    assert created_lead.status == "qualified"
    assert float(created_lead.estimated_value) == 38000.0
    print(f"  [PASS] Qualified lead created immediately: {created_lead.company_name} (${float(created_lead.estimated_value):,.2f})")

    print("=== 8. Testing Directive: Immediate Invoice & Checkout Link Generation ===")
    chat_req6 = AgentChatRequest(
        message="Generate invoice for $14,500 for Quantum AI Labs",
        auto_execute=True,
    )
    resp6 = CompanyAgentService.process_agent_command(session, exec_user, chat_req6)
    assert len(resp6.executed_actions) == 1
    act6 = resp6.executed_actions[0]
    assert act6.action_type == "generate_invoice"
    assert "/billing/pay?" in act6.details["checkout_url"]
    assert "amount=14500.00" in act6.details["checkout_url"]
    print(f"  [PASS] Invoice minted immediately: {act6.details['invoice_number']} -> {act6.details['checkout_url']}")

    print("\n ALL VIRTUAL BUSINESS EMPLOYEE TESTS PASSED WITH ZERO REGRESSIONS!")


from sqlalchemy import select

if __name__ == "__main__":
    test_virtual_employee()
