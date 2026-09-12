export interface DepartmentHealth {
  id: string;
  name: string;
  headcount: number;
  presentToday: number;
  openTasks: number;
  overdueTasks: number;
  healthScore: number;
  grade: string;
}

export interface CompanyPulseMetrics {
  headcount: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  openTasks: number;
  overdueTasks: number;
  inReviewTasks: number;
  completedTasksThisWeek: number;
  activeProjects: number;
  projectsAtRisk: number;
  totalLeads: number;
  qualifiedLeads: number;
  pipelineEstimatedValue: number;
  unreadContactMessages: number;
  healthScore: number;
  operationalGrade: string;
  departments?: DepartmentHealth[];
}

export interface AnomalyItem {
  id: string;
  category: "delivery" | "hr" | "sales" | "communication" | string;
  severity: "critical" | "warning" | "info" | string;
  title: string;
  description: string;
  suggestedAction?: string | null;
  actionType?: string | null;
  actionPayload?: Record<string, unknown> | null;
}

export interface ExecutiveBriefing {
  generatedAt: string;
  headline: string;
  healthScore: number;
  operationalGrade: string;
  summary: string;
  audioSummary?: string;
  topAchievements: string[];
  criticalRisks: string[];
  strategicRecommendations: string[];
  urgentAnomalies: AnomalyItem[];
}

export interface AgentActionRequest {
  actionType: string;
  parameters?: Record<string, unknown>;
}

export interface AgentActionResponse {
  success: boolean;
  actionType: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | null;
}

export interface AgentChatRequest {
  message: string;
  history?: AgentChatMessage[];
}

export interface AgentChatResponse {
  reply: string;
  suggestedActions: AnomalyItem[];
  relatedMetrics?: Record<string, unknown> | null;
}

export interface CompanyAuditRunResponse {
  timestamp: string;
  durationMs: number;
  healthScore: number;
  operationalGrade: string;
  anomaliesCount: number;
  criticalCount: number;
  anomalies: AnomalyItem[];
  executiveSummary: string;
}
