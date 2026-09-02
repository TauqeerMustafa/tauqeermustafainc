"""Staff onboarding — keep a user's HR profile in lockstep with their account.

The whole employee portal resolves the caller through their ``Employee`` row:
``/dashboard/employee``, ``/attendance/me``, ``/attendance/check-in``,
``/attendance/check-out``, ``/leave/me``, ``/leave/request`` and
``/documents/me`` all 403 with *"Current user is not mapped to an employee
profile"* when it is missing.

Only ``POST /employees/`` ever created that row. Anyone onboarded through
Admin → Users got a ``User`` and a mailbox but no profile, so they signed in to
a portal where the dashboard, attendance, leave and documents pages all failed.
Both creation paths now call :func:`ensure_employee_profile`, and migration
``a7b4c2e18d95`` backfills the accounts that predate it.

Clients are deliberately excluded: they live in the client portal and have no
attendance, leave, or HR record.

The second half of the module is the other side of onboarding — mailing a new
hire their credentials. It lives here because it can only run at the same
moment: see :func:`send_welcome_email`.
"""

from __future__ import annotations

import smtplib
from datetime import date
from email.message import EmailMessage

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.core.rbac import ROLE_CLIENT
from app.models.employee import Employee
from app.models.user import User

logger = get_logger(__name__)

# Human-facing staff numbers: TMI-0001, TMI-0002, ...
EMPLOYEE_ID_PREFIX = "TMI-"


def _role_slug(user: User) -> str | None:
    role = getattr(user, "role", None)
    return getattr(role, "slug", None)


def is_staff_user(user: User) -> bool:
    """True for anyone who belongs in the staff portal (i.e. not a client)."""
    return _role_slug(user) != ROLE_CLIENT


def next_employee_number(db: Session) -> str:
    """Next free ``TMI-0000`` code.

    Derived from how many codes already use the prefix rather than from a
    sequence, then advanced past any collision so a manually-assigned code can
    never wedge onboarding.
    """
    used = db.scalar(
        select(func.count(Employee.id)).where(
            Employee.employee_id_string.like(f"{EMPLOYEE_ID_PREFIX}%")
        )
    ) or 0
    candidate = used + 1
    for _ in range(1000):
        code = f"{EMPLOYEE_ID_PREFIX}{candidate:04d}"
        if db.scalar(select(Employee.id).where(Employee.employee_id_string == code)) is None:
            return code
        candidate += 1
    # Pathological case only (1000 consecutive collisions): fall back to no code.
    return ""


def ensure_employee_profile(
    db: Session,
    user: User,
    *,
    job_title: str | None = None,
    joining_date: date | None = None,
) -> Employee | None:
    """Return ``user``'s HR profile, creating it if absent.

    Idempotent, and non-fatal by design: a failure here must never take down
    account creation, so problems are logged and ``None`` is returned. The
    caller is responsible for committing.
    """
    if not is_staff_user(user):
        return None

    existing = db.scalar(select(Employee).where(Employee.user_id == user.id))
    if existing is not None:
        return existing

    try:
        # A SAVEPOINT, so a failed profile insert rolls back only itself and
        # leaves the caller's new user intact — account creation must never fail
        # because of the HR record.
        with db.begin_nested():
            profile = Employee(
                user_id=user.id,
                employee_id_string=next_employee_number(db) or None,
                job_title=job_title or (user.role.name if user.role else None),
                joining_date=joining_date or date.today(),
                status="active" if user.status == "approved" else "inactive",
            )
            db.add(profile)
        return profile
    except Exception as exc:  # pragma: no cover - defensive
        logger.error("could not create an employee profile for %s: %s", user.email, exc)
        return None


# ── Welcome email ─────────────────────────────────────────────────────────────
#
# ``POST /admin/users`` is the only moment the plaintext password exists: it
# arrives in the request body and is hashed immediately, so nothing downstream
# can ever resend it. The congratulations message therefore goes out from inside
# the create handler or not at all.
#
# Where each role actually signs in — a member lands in the employee portal, an
# exec or team lead in management, an admin in the console.
_LOGIN_PATHS = {
    "admin": "/admin/login",
    "exec": "/management/login",
    "team_lead": "/management/login",
    "member": "/employees/login",
    "client": "/client/login",
}


def login_url_for_role(role_slug: str | None) -> str:
    base = settings.client_portal_url.rstrip("/")
    return f"{base}{_LOGIN_PATHS.get(role_slug or '', '/employees/login')}"


def _welcome_body(
    name: str, email: str, password: str, role_name: str, login_url: str
) -> str:
    first_name = name.split()[0] if name.strip() else "there"
    return f"""Congratulations {first_name} — welcome to Tauqeer Mustafa Inc.

Your {role_name} account is live and you can start today. Here are your
credentials:

    Portal    {login_url}
    Email     {email}
    Password  {password}

Please sign in and change that password from Settings before you do anything
else — it was generated for you and nobody else should ever need it.

Your work is already waiting on the portal:

  * Tasks        everything assigned to you, by stage
  * My Pipeline  your own lead book — source it, work it, log every touch
  * Attendance   check in when you start and out when you finish
  * Documents    company policies, including the lead generation playbook

Read the tasks in order. If something is unclear, ask before you guess.

Welcome aboard.

— Tauqeer Mustafa Inc
"""


def send_welcome_email(
    *,
    to_email: str,
    name: str,
    account_email: str,
    password: str,
    role_slug: str | None,
    role_name: str,
) -> bool:
    """Mail the credentials to ``to_email``. Returns whether it actually sent.

    ``to_email`` is usually a personal address: a brand-new hire cannot read the
    company mailbox these credentials unlock, so mailing them there would be a
    closed loop. Never raises — the account already exists by this point, and
    failing the request would leave the admin thinking nothing was created.
    """
    if not all((settings.smtp_host, settings.smtp_from_email)):
        logger.warning(
            "SMTP is not configured; welcome email for %s was not sent", account_email
        )
        return False

    login_url = login_url_for_role(role_slug)
    message = EmailMessage()
    message["Subject"] = "Welcome to Tauqeer Mustafa Inc — your portal credentials"
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(
        _welcome_body(name, account_email, password, role_name, login_url)
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception:
        logger.exception("could not send the welcome email for %s", account_email)
        return False
    return True
