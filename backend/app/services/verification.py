import json
import logging
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email_code(email: str, code: str) -> bool:
    subject = "Your Tauqeer Mustafa Inc. verification code"
    text = (
        f"Your Tauqeer Mustafa Inc. client portal verification code is {code}. It expires in "
        f"{settings.verification_code_ttl_minutes} minutes. If you did not request this, ignore this email."
    )

    # 1. Try sending via open.email if configured
    if settings.openemail_api_key:
        try:
            from app.services import openemail
            candidates = [m for m in openemail.list_mailboxes() if m.get("primaryAddress")]
            candidates.sort(key=lambda m: 0 if str(m["primaryAddress"]).startswith("admin@") else 1)
            mb = next(iter(candidates), None)
            if mb and mb.get("id") and mb.get("primaryAddress"):
                openemail.send_message(
                    mb["id"],
                    from_email=mb["primaryAddress"],
                    from_name="Tauqeer Mustafa Inc",
                    to=[email],
                    subject=subject,
                    text=text,
                    save=False,
                )
                logger.info("Sent verification code to %s via open.email", email)
                return True
        except Exception as exc:
            logger.warning("open.email failed to send verification code to %s: %s", email, exc)

    # 2. Try sending via SMTP if configured
    if all((settings.smtp_host, settings.smtp_from_email)):
        try:
            message = EmailMessage()
            message["Subject"] = subject
            message["From"] = settings.smtp_from_email
            message["To"] = email
            message.set_content(text)
            if settings.smtp_port == 465:
                with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=12) as server:
                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                    server.send_message(message)
            else:
                with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=12) as server:
                    if settings.smtp_use_tls:
                        server.starttls()
                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                    server.send_message(message)
            logger.info("Sent verification code to %s via SMTP", email)
            return True
        except Exception as exc:
            logger.warning("SMTP failed to send verification code to %s: %s", email, exc)
            return False

    logger.warning("No active email provider configured; verification code %s generated for %s", code, email)
    return False


def google_authorization_url(state: str) -> str:
    if not settings.google_client_id or not settings.google_redirect_uri:
        raise RuntimeError("Google OAuth is not configured")
    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "select_account",
    })
    return f"https://accounts.google.com/o/oauth2/v2/auth?{params}"


def exchange_google_code(code: str) -> dict[str, str]:
    if not settings.google_client_id or not settings.google_client_secret or not settings.google_redirect_uri:
        raise RuntimeError("Google OAuth is not configured")
    token_request = Request(
        "https://oauth2.googleapis.com/token",
        data=urlencode({
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        }).encode(),
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urlopen(token_request, timeout=20) as response:
        token_data = json.loads(response.read())
    access_token = token_data.get("access_token")
    if not access_token:
        raise RuntimeError("Google did not return an access token")
    user_request = Request("https://openidconnect.googleapis.com/v1/userinfo", headers={"Authorization": f"Bearer {access_token}"})
    with urlopen(user_request, timeout=20) as response:
        profile = json.loads(response.read())
    return {"sub": profile["sub"], "email": profile["email"], "first_name": profile.get("given_name", ""), "last_name": profile.get("family_name", "")}
