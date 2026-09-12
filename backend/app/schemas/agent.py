from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from app.schemas.common import CamelModel


class DepartmentHealth(CamelModel):
    id: str
    name: str
    headcount: int = 0
    present_today: int = 0
    open_tasks: int = 0
    overdue_tasks: int = 0
    health_score: int = 100
    grade: str = "A"


class CompanyPulseMetrics(CamelModel):
    headcount: int = 0
    active_employees: int = 0
    present_today: int = 0
    absent_today: int = 0
    late_today: int = 0
    on_leave_today: int = 0
    pending_leaves: int = 0
    open_tasks: int = 0
    overdue_tasks: int = 0
    in_review_tasks: int = 0
    completed_tasks_this_week: int = 0
    active_projects: int = 0
    projects_at_risk: int = 0
    total_leads: int = 0
    qualified_leads: int = 0
    pipeline_estimated_value: float = 0.0
    unread_contact_messages: int = 0
    health_score: int = 100
    operational_grade: str = "A"
    departments: list[DepartmentHealth] = []


class AnomalyItem(CamelModel):
    id: str
    category: str  # "delivery" | "hr" | "sales" | "communication"
    severity: str  # "critical" | "warning" | "info"
    title: str
    description: str
    suggested_action: Optional[str] = None
    action_type: Optional[str] = None
    action_payload: Optional[dict[str, Any]] = None


class ExecutiveBriefing(CamelModel):
    generated_at: datetime
    headline: str
    health_score: int
    operational_grade: str
    summary: str
    audio_summary: str = ""
    top_achievements: list[str] = []
    critical_risks: list[str] = []
    strategic_recommendations: list[str] = []
    urgent_anomalies: list[AnomalyItem] = []


class AgentActionRequest(CamelModel):
    action_type: str
    parameters: dict[str, Any] = {}


class AgentActionResponse(CamelModel):
    success: bool
    action_type: str
    message: str
    details: Optional[dict[str, Any]] = None


class AgentChatMessage(CamelModel):
    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[datetime] = None


class AgentChatRequest(CamelModel):
    message: str
    history: list[AgentChatMessage] = []


class AgentChatResponse(CamelModel):
    reply: str
    suggested_actions: list[AnomalyItem] = []
    related_metrics: Optional[dict[str, Any]] = None


class CompanyAuditRunResponse(CamelModel):
    timestamp: datetime
    duration_ms: int
    health_score: int
    operational_grade: str
    anomalies_count: int
    critical_count: int
    anomalies: list[AnomalyItem] = []
    executive_summary: str
