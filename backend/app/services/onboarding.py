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
"""

from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

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
