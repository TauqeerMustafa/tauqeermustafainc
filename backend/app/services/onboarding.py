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

import re
import smtplib
from datetime import date
from email.message import EmailMessage

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.core.rbac import ROLE_CLIENT
from app.models.employee import Employee
from app.models.user import User

logger = get_logger(__name__)

# Human-facing staff numbers: 006001, 006002, ... Six digits, and the series
# starts partway in rather than at 1 on purpose — a staff number gets quoted in
# email signatures and to clients, and "000001" tells them exactly how many
# people work here. Migration ``d2f8b6a3c514`` moved the earlier ``TMI-0001``
# codes into this series, so there is one format on the books.
EMPLOYEE_ID_WIDTH = 6
EMPLOYEE_ID_START = 6001

# What counts as one of ours. The column also holds whatever an admin typed by
# hand, and those are left out of the numbering rather than parsed.
_ISSUED_CODE = re.compile(r"^[0-9]+$")


def format_employee_number(value: int) -> str:
    """``6001`` → ``"006001"``."""
    return f"{value:0{EMPLOYEE_ID_WIDTH}d}"


def _role_slug(user: User) -> str | None:
    role = getattr(user, "role", None)
    return getattr(role, "slug", None)


def is_staff_user(user: User) -> bool:
    """True for anyone who belongs in the staff portal (i.e. not a client)."""
    return _role_slug(user) != ROLE_CLIENT


def next_employee_number(db: Session) -> str:
    """Next free staff number, e.g. ``006001``.

    Taken from the highest number already issued rather than from a count of
    rows, so deleting a profile cannot hand the same code to two people. Then
    advanced past any collision, so a code somebody assigned by hand can never
    wedge onboarding.
    """
    issued = [
        int(code)
        for (code,) in db.execute(select(Employee.employee_id_string)).all()
        if code and _ISSUED_CODE.match(code.strip())
    ]
    candidate = max(max(issued, default=0) + 1, EMPLOYEE_ID_START)
    for _ in range(1000):
        code = format_employee_number(candidate)
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

  * Tasks          everything assigned to you, by stage
  * My Pipeline    your own lead book - source it, work it, log every touch
  * Lead Playbook  how we find leads, and what is expected of you
  * Attendance     check in when you start and out when you finish
  * Documents      company policies and handbooks

Start with Lead Playbook, then read the tasks in order. If something is unclear,
ask before you guess.

Welcome aboard.

— Tauqeer Mustafa Inc
"""


_WELCOME_SUBJECT = "Welcome to Tauqeer Mustafa Inc — your portal credentials"


def _send_via_openemail(
    *,
    to_email: str,
    subject: str,
    text: str,
    sender_mailbox_id: str | None,
    sender_address: str | None,
    sender_name: str | None,
) -> bool:
    """Send through the company's open.email account. Never raises.

    Preferred over SMTP because the API key is already configured for mailbox
    provisioning, so onboarding works with no extra mail setup. Sends from the
    admin who created the account when they have a mailbox — the new hire then
    has a real person to reply to, and ``save=true`` leaves the message in that
    admin's Sent folder as the record that credentials went out.
    """
    from app.services import openemail

    mailbox_id = sender_mailbox_id
    from_email = sender_address
    if not mailbox_id:
        # No mailbox on the creating admin (older account, or provisioning was
        # off): fall back to a company mailbox. Filter on primaryAddress first —
        # open.email lists mailboxes that have none, and those cannot send —
        # then prefer admin@ over whatever happens to come back first.
        candidates = [m for m in openemail.list_mailboxes() if m.get("primaryAddress")]
        candidates.sort(
            key=lambda m: 0 if str(m["primaryAddress"]).startswith("admin@") else 1
        )
        fallback = next(iter(candidates), None)
        if fallback:
            mailbox_id = fallback.get("id")
            from_email = from_email or fallback.get("primaryAddress")
    if not mailbox_id or not from_email:
        return False

    try:
        openemail.send_message(
            mailbox_id,
            from_email=from_email,
            from_name=sender_name or "Tauqeer Mustafa Inc",
            to=[to_email],
            subject=subject,
            text=text,
            save=True,
        )
    except Exception:
        logger.warning("open.email could not deliver to %s; trying SMTP", to_email)
        return False
    return True


def _send_via_smtp(*, to_email: str, subject: str, text: str) -> bool:
    """Fallback path, used only when open.email is unavailable. Never raises."""
    if not all((settings.smtp_host, settings.smtp_from_email)):
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(text)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception:
        logger.exception("SMTP could not deliver to %s", to_email)
        return False
    return True


def send_welcome_email(
    *,
    to_email: str,
    name: str,
    account_email: str,
    password: str,
    role_slug: str | None,
    role_name: str,
    sender_mailbox_id: str | None = None,
    sender_address: str | None = None,
    sender_name: str | None = None,
) -> str | None:
    """Mail the credentials to ``to_email``. Returns the channel used, or None.

    ``to_email`` is usually a personal address: a brand-new hire cannot read the
    company mailbox these credentials unlock, so mailing them there would be a
    closed loop. Never raises — the account already exists by this point, and
    failing the request would leave the admin thinking nothing was created. The
    return value is the channel name so the response can say how it went out,
    and ``None`` so the admin knows to hand the credentials over another way.
    """
    body = _welcome_body(
        name, account_email, password, role_name, login_url_for_role(role_slug)
    )

    if _send_via_openemail(
        to_email=to_email,
        subject=_WELCOME_SUBJECT,
        text=body,
        sender_mailbox_id=sender_mailbox_id,
        sender_address=sender_address,
        sender_name=sender_name,
    ):
        return "open.email"
    if _send_via_smtp(to_email=to_email, subject=_WELCOME_SUBJECT, text=body):
        return "SMTP"

    logger.warning(
        "no mail channel available; credentials for %s were not sent", account_email
    )
    return None
