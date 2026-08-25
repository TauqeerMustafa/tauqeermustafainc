import json
import logging
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email_code(email: str, code: str) -> None:
    if not all((settings.smtp_host, settings.smtp_from_email)):
        if settings.environment == "production":
            raise RuntimeError("SMTP is not configured")
        logger.warning("SMTP is not configured; email verification code generated for %s", email)
        return
    message = EmailMessage()
    message["Subject"] = "Your TMI client portal verification code"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message.set_content(
        f"Your TMI client portal verification code is {code}. It expires in "
        f"{settings.verification_code_ttl_minutes} minutes. If you did not request this, ignore this email."
    )
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)


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
