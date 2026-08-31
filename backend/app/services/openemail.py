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


def provision_user_mailbox(email: str) -> dict | None:
    """Create an open.email mailbox for ``email`` and return its record.

    Returns the mailbox dict on success, or ``None`` when provisioning was
    skipped or failed (missing key, duplicate address, network/API error).
    Never raises — account creation must proceed regardless.
    """
    token = os.environ.get("OPENEMAIL_API_KEY")
    if not token:
        logger.warning(
            "OPENEMAIL_API_KEY is not set; skipping mailbox provisioning for %s", email
        )
        return None

    try:
        response = httpx.post(
            f"{OPENEMAIL_API_URL}/mailboxes",
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
    token = os.environ.get("OPENEMAIL_API_KEY")
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
