export interface CommonMetadata {
  id: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service extends CommonMetadata {
  title: string;
  shortDescription: string;
  description: string;
  icon?: string;
  outcomes: string[];
}

export interface Blog extends CommonMetadata {
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Portfolio extends CommonMetadata {
  title: string;
  summary: string;
  category: string;
  impact?: string;
  technologies: string[];
  gallery?: string[];
}

export interface Career extends CommonMetadata {
  title: string;
  location: string;
  type: string;
  summary: string;
  responsibilities?: string[];
  isOpen: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Contact {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export type UserStatus = "pending" | "approved" | "rejected" | "suspended";

export interface User extends CommonMetadata {
  name: string;
  email: string;
  role?: string;
  phone?: string;
  status?: UserStatus;
  permissions?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleSlug?: string;
  roleName?: string;
  status: UserStatus;
  teamId?: string;
  teamName?: string;
  /** Auto-provisioned open.email address (equals the account email). */
  openemailAddress?: string | null;
  /** True only when a real open.email mailbox is linked (not just an address). */
  hasMailbox?: boolean;
  approvedAt?: string;
  createdAt: string;
}

export interface AdminPermission {
  id: string;
  slug: string;
  description?: string | null;
}

export interface AdminRole {
  id: string;
  slug: string;
  name: string;
  hierarchyLevel: number;
  description?: string;
  isSystem: boolean;
  /** GET /admin/roles eager-loads these, so counts are available on the list. */
  permissions?: AdminPermission[];
}

export interface AdminTeam {
  id: string;
  name: string;
  teamLeadId?: string;
  teamLeadName?: string;
  memberCount: number;
  createdAt: string;
}

export interface AdminMetrics {
  total: number;
  pending: number;
  approved: number;
  suspended: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

// ── Leads / sales pipeline ────────────────────────────────────────────────────

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost";

export type LeadSource = "cold_call" | "linkedin" | "referral" | "email" | "other";

export interface LeadActivity {
  id: string;
  type: string;
  body: string;
  authorId?: string | null;
  authorName?: string | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  contactTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  source: LeadSource | string;
  industry?: string | null;
  status: LeadStatus | string;
  estimatedValue?: number | null;
  currency: string;
  nextFollowUpDate?: string | null;
  assignedExecId?: string | null;
  assignedExecName?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetail extends Lead {
  activities: LeadActivity[];
}

export interface PipelineStage {
  status: string;
  label: string;
  count: number;
  value: number;
}

/**
 * GET /leads/pipeline. `scope` echoes the slice the caller was allowed to see
 * ('own' | 'team' | 'all') so the UI can label the totals honestly.
 */
export interface LeadPipeline {
  scope: "own" | "team" | "all" | string;
  stages: PipelineStage[];
  totalLeads: number;
  totalValue: number;
  openValue: number;
  wonValue: number;
  lostValue: number;
  followUpsDue: number;
}
