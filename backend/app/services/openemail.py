"""open.email mailbox provisioning.

When an admin creates any user, we automatically provision an open.email
mailbox whose primary address is the account email the admin entered, so the
new user has a working inbox from day one. It is intentionally *non-fatal*:
mail provisioning must never block account creation. If the API key is missing, the
address is already taken, or the API is unreachable, we log and return ``None``
and the user is still created.

Contract (open.email REST API):
    POST https://api.open.email/api/v1/mailboxes
    Authorization: Bearer <OPENEMAIL_API_KEY>
    body: {"primaryAddress": "you@example.com"}
    -> 200/201 with the created mailbox {"id", "primaryAddress", ...}
    -> 409 if that address already has a mailbox (nothing is created)
"""
import logging
import os

import httpx

logger = logging.getLogger(__name__)

OPENEMAIL_API_URL = "https://api.open.email/api/v1"


def _api_token() -> str | None:
    """The open.email API key, from Settings first, then the raw environment.

    Settings reads ``backend/.env`` *and* real process env vars (Render injects
    the latter), whereas ``os.environ`` alone misses a value that lives only in
    the ``.env`` file — so local dev would wrongly see "key missing". Preferring
    Settings makes provisioning/send behave the same locally and in prod.
    """
    from app.core.config import settings

    return settings.openemail_api_key or os.environ.get("OPENEMAIL_API_KEY")


def provision_user_mailbox(email: str) -> dict | None:
    """Create an open.email mailbox for ``email`` and return its record.

    Returns the mailbox dict on success, or ``None`` when provisioning was
    skipped or failed (missing key, duplicate address, network/API error).
    Never raises — account creation must proceed regardless.
    """
    token = _api_token()
    if not token:
        logger.warning(
            "OPENEMAIL_API_KEY is not set; skipping mailbox provisioning for %s", email
        )
        return None

    try:
        response = httpx.post(
            f"{OPENEMAIL_API_URL}/identities",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={"primaryAddress": email},
            timeout=15.0,
        )
    except httpx.RequestError as exc:
        logger.error("open.email request error provisioning %s: %s", email, exc)
        return None

    if response.status_code == 409:
        logger.info("open.email mailbox for %s already exists (409)", email)
        return None

    if response.status_code not in (200, 201):
        logger.error(
            "open.email mailbox provisioning for %s failed (%s): %s",
            email,
            response.status_code,
            response.text[:500],
        )
        return None

    try:
        data = response.json()
    except ValueError:
        logger.error("open.email returned a non-JSON body for %s", email)
        return None

    # The API may wrap the record under a "data" key; accept either shape.
    return data.get("data", data) if isinstance(data, dict) else None


def list_mailboxes() -> list[dict]:
    """Return every mailbox on the org account, or ``[]`` on any problem.

    open.email may return a bare list, ``{"mailboxes": [...]}`` or
    ``{"data": [...]}``; all three are normalized to a list. Never raises —
    callers treat an empty list as "could not enumerate".
    """
    token = _api_token()
    if not token:
        logger.warning("OPENEMAIL_API_KEY is not set; cannot list mailboxes")
        return []

    try:
        response = httpx.get(
            f"{OPENEMAIL_API_URL}/identities",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15.0,
        )
    except httpx.RequestError as exc:
        logger.error("open.email request error listing mailboxes: %s", exc)
        return []

    if response.status_code not in (200, 201):
        logger.error(
            "open.email list mailboxes failed (%s): %s",
            response.status_code,
            response.text[:500],
        )
        return []

    try:
        data = response.json()
    except ValueError:
        return []

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("identities") or data.get("mailboxes") or data.get("data") or []
    else:
        items = []
    return [m for m in items if isinstance(m, dict)]


def find_mailbox_by_address(email: str) -> dict | None:
    """Find an existing mailbox whose primary address equals ``email``."""
    target = email.strip().lower()
    for mb in list_mailboxes():
        addr = str(mb.get("primaryAddress") or "").strip().lower()
        if addr and addr == target:
            return mb
    return None


def ensure_user_mailbox(email: str) -> dict | None:
    """Idempotently guarantee a mailbox exists for ``email`` and return it.

    Unlike :func:`provision_user_mailbox`, this first looks the address up so a
    mailbox that already exists (e.g. the user was recreated, or provisioning
    once failed after the mailbox was made) is *linked* rather than reported as
    a duplicate. Used by the admin backfill so existing users created while the
    key was missing can be repaired without deleting them. Returns ``None`` only
    when no mailbox exists and one could not be created.
    """
    existing = find_mailbox_by_address(email)
    if existing:
        return existing
    return provision_user_mailbox(email)


class OpenEmailSendError(RuntimeError):
    """Raised when open.email rejects or fails a send. Carries the status so the
    scheduler can record a useful error against the queued row."""


def send_message(
    mailbox_id: str,
    *,
    from_email: str,
    to: list[str],
    subject: str,
    from_name: str | None = None,
    text: str | None = None,
    html: str | None = None,
    save: bool = True,
) -> dict:
    """Send a message from ``mailbox_id`` via open.email and return the response.

    open.email validates addresses under ``email`` (NOT ``address``): sending
    ``address`` returns 400 validation_failed on body.from.email / body.to.N.email.
    Body text goes in ``text``/``html`` (a ``body`` field is silently ignored).
    This mirrors the frontend's fixed payload so scheduled sends behave exactly
    like interactive ones. Raises :class:`OpenEmailSendError` on any failure so
    the dispatcher can mark the row failed rather than silently dropping it.
    """
    token = _api_token()
    if not token:
        raise OpenEmailSendError("OPENEMAIL_API_KEY is not set")

    recipients = [addr for addr in to if addr]
    if not recipients:
        raise OpenEmailSendError("No recipients")

    body: dict = {
        "from": {"email": from_email, **({"name": from_name} if from_name else {})},
        "to": [{"email": addr} for addr in recipients],
        "subject": subject,
    }
    if text:
        body["text"] = text
    if html:
        body["html"] = html

    query = "?save=true" if save else ""
    try:
        response = httpx.post(
            f"{OPENEMAIL_API_URL}/mailboxes/{mailbox_id}/send{query}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=30.0,
        )
    except httpx.RequestError as exc:
        raise OpenEmailSendError(f"network error: {exc}") from exc

    if response.status_code not in (200, 201):
        detail = response.text[:500]
        raise OpenEmailSendError(f"open.email {response.status_code}: {detail}")

    try:
        data = response.json()
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}
