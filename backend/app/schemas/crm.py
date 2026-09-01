import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel


# ── Enums (stored as slugs; validated here, not as native PG enums) ────────────
class LeadSource(str, Enum):
    cold_call = "cold_call"
    linkedin = "linkedin"
    referral = "referral"
    email = "email"
    other = "other"


class LeadStatus(str, Enum):
    new = "new"
    contacted = "contacted"
    follow_up = "follow_up"
    qualified = "qualified"
    proposal_sent = "proposal_sent"
    won = "won"
    lost = "lost"


class UserStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"


class ActivityType(str, Enum):
    note = "note"
    status_change = "status_change"
    call = "call"
    email = "email"
    meeting = "meeting"


# ── Auth / registration ────────────────────────────────────────────────────────
class RegisterRequest(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    phone: str | None = Field(default=None, max_length=40)


# ── Roles & permissions ─────────────────────────────────────────────────────────
class PermissionRead(CamelModel):
    id: uuid.UUID
    slug: str
    description: str | None = None


class RoleRead(CamelModel):
    id: uuid.UUID
    slug: str
    name: str
    hierarchy_level: int
    description: str | None = None
    is_system: bool
    permissions: list[PermissionRead] = Field(default_factory=list)

class RoleCreate(CamelModel):
    slug: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=1, max_length=120)
    hierarchy_level: int = Field(default=0, ge=0)
    description: str | None = Field(default=None, max_length=300)

class RoleUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    hierarchy_level: int | None = Field(default=None, ge=0)
    description: str | None = Field(default=None, max_length=300)

class AssignPermissionsRequest(CamelModel):
    permission_ids: list[uuid.UUID]


# ── Teams ───────────────────────────────────────────────────────────────────────
class TeamCreate(CamelModel):
    name: str = Field(min_length=1, max_length=160)
    team_lead_id: uuid.UUID | None = None


class TeamUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    team_lead_id: uuid.UUID | None = None


class TeamRead(CamelModel):
    id: uuid.UUID
    name: str
    team_lead_id: uuid.UUID | None = None
    team_lead_name: str | None = None
    member_count: int = 0
    created_at: datetime


# ── Users (admin view / management) ──────────────────────────────────────────────
class AdminUserRead(CamelModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str | None = None
    role_slug: str | None = None
    role_name: str | None = None
    status: str
    team_id: uuid.UUID | None = None
    team_name: str | None = None
    openemail_address: str | None = None
    # True only when a real open.email mailbox is linked. ``openemail_address``
    # can be set (it falls back to the account email) while no mailbox exists,
    # so the UI keys "needs a mailbox" off this flag, not the address.
    has_mailbox: bool = False
    approved_at: datetime | None = None
    created_at: datetime


class ApproveUserRequest(CamelModel):
    role_slug: str = Field(default="exec", min_length=1, max_length=60)
    team_id: uuid.UUID | None = None


class AdminUserCreate(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    phone: str | None = Field(default=None, max_length=40)
    role_slug: str = Field(default="exec", min_length=1, max_length=60)
    team_id: uuid.UUID | None = None
    status: UserStatus = UserStatus.approved


class UpdateUserRequest(CamelModel):
    role_slug: str | None = Field(default=None, max_length=60)
    team_id: uuid.UUID | None = None
    status: UserStatus | None = None


# ── Lead activities ──────────────────────────────────────────────────────────────
class LeadActivityCreate(CamelModel):
    type: ActivityType = ActivityType.note
    body: str = Field(min_length=1, max_length=4000)


class LeadActivityRead(CamelModel):
    id: uuid.UUID
    type: str
    body: str
    author_id: uuid.UUID | None = None
    author_name: str | None = None
    created_at: datetime


# ── Leads ────────────────────────────────────────────────────────────────────────
class LeadCreate(CamelModel):
    company_name: str = Field(min_length=1, max_length=200)
    contact_person: str = Field(min_length=1, max_length=160)
    contact_title: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    source: LeadSource = LeadSource.other
    industry: str | None = Field(default=None, max_length=120)
    status: LeadStatus = LeadStatus.new
    estimated_value: float | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    next_follow_up_date: date | None = None
    # Admins/team leads may assign; execs are forced to themselves server-side.
    assigned_exec_id: uuid.UUID | None = None

    @field_validator("currency")
    @classmethod
    def _upper_currency(cls, v: str) -> str:
        return v.upper()


class LeadUpdate(CamelModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=200)
    contact_person: str | None = Field(default=None, min_length=1, max_length=160)
    contact_title: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    source: LeadSource | None = None
    industry: str | None = Field(default=None, max_length=120)
    status: LeadStatus | None = None
    estimated_value: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    next_follow_up_date: date | None = None
    assigned_exec_id: uuid.UUID | None = None

    @field_validator("currency")
    @classmethod
    def _upper_currency(cls, v: str | None) -> str | None:
        return v.upper() if v else v


class LeadRead(CamelModel):
    id: uuid.UUID
    company_name: str
    contact_person: str
    contact_title: str | None = None
    phone: str | None = None
    email: str | None = None
    source: str
    industry: str | None = None
    status: str
    estimated_value: float | None = None
    currency: str
    next_follow_up_date: date | None = None
    assigned_exec_id: uuid.UUID | None = None
    assigned_exec_name: str | None = None
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class LeadDetail(LeadRead):
    activities: list[LeadActivityRead] = Field(default_factory=list)


# ── Pipeline reporting ───────────────────────────────────────────────────────────
class PipelineStage(CamelModel):
    """One column of the sales funnel, aggregated over the caller's read scope."""

    status: str
    label: str
    count: int = 0
    value: float = 0.0


class LeadPipelineResponse(CamelModel):
    """Aggregate view behind the management portal's Pipeline page.

    ``scope`` echoes which slice the caller was allowed to see ('own', 'team' or
    'all') so the UI can label the numbers honestly instead of implying they are
    company-wide.
    """

    scope: str
    stages: list[PipelineStage] = Field(default_factory=list)
    total_leads: int = 0
    total_value: float = 0.0
    open_value: float = 0.0
    won_value: float = 0.0
    lost_value: float = 0.0
    follow_ups_due: int = 0
