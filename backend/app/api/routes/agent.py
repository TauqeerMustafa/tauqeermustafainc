import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentManager, DatabaseSession
from app.models.lead import Lead
from app.models.portal import ClientProject
from app.schemas.agent import (
    AgentActionRequest,
    AgentActionResponse,
    AgentChatRequest,
    AgentChatResponse,
    CompanyAuditRunResponse,
    CompanyPulseMetrics,
    ExecutiveBriefing,
    LeadToCashCycleRequest,
    LeadToCashCycleResponse,
    PaymentGenerationRequest,
    PaymentLinkInfo,
    ProjectProvisionRequest,
    ProposalDossier,
    ProposalGenerationRequest,
)
from app.services.company_agent import CompanyAgentService

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/")
def get_agent_status():
    """Returns AI Agent status and active capabilities."""
    return {
        "service": "Autonomous Company Executive AI Agent",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": [
            "/agent/pulse",
            "/agent/briefing",
            "/agent/run-audit",
            "/agent/chat",
            "/agent/action",
            "/agent/lead-to-cash/run",
            "/agent/lead-to-cash/prospect",
            "/agent/lead-to-cash/proposal",
            "/agent/lead-to-cash/provision-project",
            "/agent/lead-to-cash/generate-payment",
        ],
    }


@router.get("/pulse", response_model=CompanyPulseMetrics)
def get_company_pulse(
    db: DatabaseSession,
    current_user: CurrentManager,
) -> CompanyPulseMetrics:
    """Returns real-time company telemetry and operational health score."""
    return CompanyAgentService.get_company_pulse(db)


@router.get("/briefing", response_model=ExecutiveBriefing)
def get_executive_briefing(
    db: DatabaseSession,
    current_user: CurrentManager,
) -> ExecutiveBriefing:
    """Returns the daily CEO/leadership intelligence briefing with risks and recommendations."""
    return CompanyAgentService.generate_executive_briefing(db)


@router.post("/run-audit", response_model=CompanyAuditRunResponse)
def run_autonomous_audit(
    db: DatabaseSession,
    current_user: CurrentManager,
) -> CompanyAuditRunResponse:
    """Triggers an on-demand autonomous audit of all company subsystems."""
    return CompanyAgentService.run_autonomous_audit(db)


@router.post("/chat", response_model=AgentChatResponse)
def chat_with_agent(
    request: AgentChatRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> AgentChatResponse:
    """Natural language conversational interface with the Autonomous Executive Agent."""
    return CompanyAgentService.process_agent_command(db, current_user, request)


@router.post("/action", response_model=AgentActionResponse)
def execute_agent_action(
    request: AgentActionRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> AgentActionResponse:
    """Executes a concrete management intervention (e.g. escalate tasks, approve leaves) with audit trail."""
    return CompanyAgentService.execute_action(
        db, current_user, request.action_type, request.parameters
    )


@router.post("/lead-to-cash/run", response_model=LeadToCashCycleResponse)
def run_lead_to_cash_cycle(
    request: LeadToCashCycleRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> LeadToCashCycleResponse:
    """1-Click Autonomous Lead-to-Cash Engine: Discovers lead, designs proposal, provisions project, and generates invoice/payment link."""
    return CompanyAgentService.run_full_lead_to_cash_cycle(db, current_user, request)


@router.post("/lead-to-cash/prospect", response_model=LeadToCashCycleResponse)
def prospect_lead(
    request: LeadToCashCycleRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> LeadToCashCycleResponse:
    """Stage 1: Discovers or creates a B2B lead and performs automated BANT qualification."""
    lead = CompanyAgentService.generate_and_qualify_lead(db, request, user=current_user)
    return LeadToCashCycleResponse(
        cycle_id=f"LEAD-{uuid.uuid4().hex[:6].upper()}",
        current_stage="qualified",
        lead_id=str(lead.id),
        company_name=lead.company_name,
        contact_person=lead.contact_person,
        email=lead.email or "",
        summary=f"Lead {lead.company_name} successfully prospected and qualified with BANT score.",
        completed=False,
    )


@router.post("/lead-to-cash/proposal", response_model=ProposalDossier)
def generate_proposal(
    request: ProposalGenerationRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> ProposalDossier:
    """Stage 2: Synthesizes comprehensive architecture scope, deliverables, and milestone fees."""
    try:
        lead_uuid = uuid.UUID(request.lead_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead_id format.")

    try:
        return CompanyAgentService.create_deal_proposal(
            db,
            lead_id=lead_uuid,
            service_type=request.service_type,
            target_budget=request.target_budget,
            user=current_user,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/lead-to-cash/provision-project", response_model=LeadToCashCycleResponse)
def provision_project_from_lead(
    request: ProjectProvisionRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> LeadToCashCycleResponse:
    """Stage 3: Wins the deal, provisions a ClientProject, and dispatches sprint ProjectTasks."""
    try:
        lead_uuid = uuid.UUID(request.lead_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead_id format.")

    lead = db.scalar(select(Lead).where(Lead.id == lead_uuid))
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

    project, tasks = CompanyAgentService.convert_lead_to_project(db, lead_id=lead_uuid, user=current_user)
    return LeadToCashCycleResponse(
        cycle_id=f"PROJ-{uuid.uuid4().hex[:6].upper()}",
        current_stage="project_provisioned",
        lead_id=str(lead.id),
        company_name=lead.company_name,
        contact_person=lead.contact_person,
        email=lead.email or "",
        project_id=str(project.id),
        project_name=project.name,
        tasks_created_count=len(tasks),
        summary=f"Project '{project.name}' successfully provisioned with {len(tasks)} sprint tasks assigned.",
        completed=False,
    )


@router.post("/lead-to-cash/generate-payment", response_model=PaymentLinkInfo)
def generate_payment_link(
    request: PaymentGenerationRequest,
    db: DatabaseSession,
    current_user: CurrentManager,
) -> PaymentLinkInfo:
    """Stage 4: Issues invoice number and generates checkout URL for online billing."""
    try:
        lead_uuid = uuid.UUID(request.lead_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead_id format.")

    lead = db.scalar(select(Lead).where(Lead.id == lead_uuid))
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

    project = None
    if request.project_id:
        try:
            proj_uuid = uuid.UUID(request.project_id)
            project = db.scalar(select(ClientProject).where(ClientProject.id == proj_uuid))
        except ValueError:
            pass

    return CompanyAgentService.generate_invoice_and_payment_link(
        db,
        lead=lead,
        project=project,
        amount=request.amount,
        service_type=request.service_type,
        user=current_user,
    )

