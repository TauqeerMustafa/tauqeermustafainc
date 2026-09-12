"""Automated test for the Autonomous Lead-to-Cash Engine."""
import sys
import uuid
from datetime import date, datetime, timezone

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
from app.schemas.agent import LeadToCashCycleRequest
from app.services.company_agent import CompanyAgentService


def test_lead_to_cash():
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

    print("=== 3. Testing Stage 1: Lead Discovery & BANT Qualification ===")
    req1 = LeadToCashCycleRequest(
        company_name="Apex Global Financial",
        contact_person="Evelyn Cross",
        email="e.cross@apexfinancial.com",
        industry="FinTech",
        service_type="AI Financial Copilot & Cloud Infrastructure",
        target_budget=25000.0,
    )
    lead = CompanyAgentService.generate_and_qualify_lead(session, req1, user=exec_user)
    assert lead.status == "qualified", f"Expected qualified, got {lead.status}"
    assert float(lead.estimated_value) == 25000.0
    print(f"  [PASS] Lead qualified: {lead.company_name} (${float(lead.estimated_value):,.2f})")

    print("=== 4. Testing Stage 2: Proposal Synthesis ===")
    proposal = CompanyAgentService.create_deal_proposal(
        session,
        lead_id=lead.id,
        service_type=req1.service_type,
        target_budget=25000.0,
        user=exec_user,
    )
    assert proposal.total_budget == 25000.0
    assert len(proposal.milestones) == 3
    assert lead.status == "proposal_sent"
    print(f"  [PASS] Proposal generated: {proposal.proposal_id} with {len(proposal.milestones)} milestones")

    print("=== 5. Testing Stage 3: ClientProject & Sprint Task Provisioning ===")
    project, tasks = CompanyAgentService.convert_lead_to_project(
        session,
        lead_id=lead.id,
        user=exec_user,
        proposal=proposal,
    )
    assert lead.status == "won", f"Expected won, got {lead.status}"
    assert project.name == proposal.project_title
    assert len(tasks) == 4
    print(f"  [PASS] Project provisioned: '{project.name}' with {len(tasks)} sprint tasks")

    print("=== 6. Testing Stage 4: Invoicing & Payment Checkout Link ===")
    payment = CompanyAgentService.generate_invoice_and_payment_link(
        session,
        lead=lead,
        project=project,
        amount=proposal.total_budget,
        service_type=proposal.project_title,
        user=exec_user,
    )
    assert payment.invoice_number.startswith("INV-")
    assert "/billing/pay?" in payment.checkout_url
    assert "amount=25000.00" in payment.checkout_url
    print(f"  [PASS] Payment link generated: {payment.invoice_number} -> {payment.checkout_url}")

    print("=== 7. Testing 1-Click Autonomous Loop (Full Cycle) ===")
    full_req = LeadToCashCycleRequest(
        company_name=None,
        auto_run_all=True,
    )
    cycle_resp = CompanyAgentService.run_full_lead_to_cash_cycle(session, exec_user, full_req)
    assert cycle_resp.completed is True
    assert cycle_resp.current_stage == "payment_ready"
    assert cycle_resp.proposal is not None
    assert cycle_resp.payment is not None
    assert cycle_resp.tasks_created_count == 4
    print(f"  [PASS] Full Autonomous Cycle Succeeded for '{cycle_resp.company_name}':")
    print(f"         Proposal: {cycle_resp.proposal.proposal_id} (${cycle_resp.proposal.total_budget:,.2f})")
    print(f"         Project:  {cycle_resp.project_name} ({cycle_resp.tasks_created_count} tasks)")
    print(f"         Checkout: {cycle_resp.payment.checkout_url}")

    print("\n ALL 5 LEAD-TO-CASH STAGES VERIFIED SUCCESSFULLY!")


if __name__ == "__main__":
    test_lead_to_cash()
