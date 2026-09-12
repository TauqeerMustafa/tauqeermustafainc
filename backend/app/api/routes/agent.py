from fastapi import APIRouter

from app.api.deps import CurrentManager, DatabaseSession
from app.schemas.agent import (
    AgentActionRequest,
    AgentActionResponse,
    AgentChatRequest,
    AgentChatResponse,
    CompanyAuditRunResponse,
    CompanyPulseMetrics,
    ExecutiveBriefing,
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
