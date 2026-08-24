import secrets
import uuid
from typing import Annotated
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import delete, select

from app.api.deps import CurrentUser, DatabaseSession
from app.api.routes.auth import _to_user_read
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_oauth_state,
    create_verification_code,
    create_verification_session,
    decode_oauth_state,
    decode_verification_session,
    hash_password,
    hash_verification_code,
    verify_password,
    verify_verification_code,
)
from app.models.portal import ClientMessage, ClientProject, VerificationCode
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import LoginResponse
from app.schemas.common import ApiResponse
from app.schemas.portal import (
    ClientLoginRequest,
    ClientOverview,
    ClientRegisterRequest,
    ClientRegisterResponse,
    CodeSentResponse,
    CodeVerificationResponse,
    GooglePhoneStartRequest,
    GooglePhoneVerifyRequest,
    SendCodeRequest,
    VerifyCodeRequest,
    ClientMessageRead,
    ClientProjectRead,
)
from app.services.verification import check_phone_code, exchange_google_code, google_authorization_url, send_email_code, send_phone_code, twilio_configured

router = APIRouter(prefix="/auth/client", tags=["client-auth"])
portal_router = APIRouter(prefix="/client", tags=["client-portal"])


def _client_role(db: DatabaseSession) -> Role:
    role = db.scalar(select(Role).where(Role.slug == "client"))
    if role is None:
        raise HTTPException(status_code=503, detail="Client portal role is not initialized")
    return role


def _client_user(user: User) -> None:
    if user.is_superuser or user.role is None or user.role.slug != "client":
        raise HTTPException(status_code=403, detail="Client portal access required")
    if user.status != "approved" or not user.is_active:
        raise HTTPException(status_code=403, detail="Your client account is not active")


def _verified_client(user: User) -> None:
    _client_user(user)
    if user.email_verified_at is None or user.phone_verified_at is None:
        raise HTTPException(status_code=403, detail="Verify your email and phone number first")


def _issue_code(db: DatabaseSession, user: User, channel: str) -> str:
    code = create_verification_code()
    db.execute(delete(VerificationCode).where(VerificationCode.user_id == user.id, VerificationCode.channel == channel, VerificationCode.consumed_at.is_(None)))
    record = VerificationCode(user_id=user.id, channel=channel, code_hash=hash_verification_code(code), expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.verification_code_ttl_minutes))
    db.add(record)
    db.commit()
    try:
        if channel == "email":
            send_email_code(user.email, code)
        else:
            if not user.phone:
                raise HTTPException(status_code=400, detail="Add a phone number before requesting a code")
            send_phone_code(user.phone, code)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="The verification provider could not send a code") from exc
    return code


def _code_response(channel: str, code: str) -> CodeSentResponse:
    # Development-only visibility keeps local setup testable without exposing
    # codes in production responses.
    debug_code = code if settings.environment != "production" and settings.debug else None
    return CodeSentResponse(channel=channel, expires_in_seconds=settings.verification_code_ttl_minutes * 60, debug_code=debug_code)


def _verification_result(user: User, db: DatabaseSession, channel: str, token: str | None = None) -> CodeVerificationResponse:
    return CodeVerificationResponse(channel=channel, verified=True, email_verified=user.email_verified_at is not None, phone_verified=user.phone_verified_at is not None, access_token=token, user=_to_user_read(user, db) if token else None)


@router.post("/register", response_model=ApiResponse[ClientRegisterResponse], status_code=status.HTTP_201_CREATED)
def client_register(payload: ClientRegisterRequest, db: DatabaseSession) -> ApiResponse[ClientRegisterResponse]:
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    role = _client_role(db)
    parts = payload.name.strip().split(" ", 1)
    user = User(first_name=parts[0], last_name=parts[1] if len(parts) > 1 else "", email=payload.email, password_hash=hash_password(payload.password), phone=payload.phone, status="approved", is_active=True, is_verified=False, is_superuser=False, role_id=role.id)
    db.add(user)
    db.commit()
    db.refresh(user)
    _issue_code(db, user, "email")
    _issue_code(db, user, "phone")
    return ApiResponse(data=ClientRegisterResponse(user_id=user.id, email=user.email, phone=user.phone or "", message="Your account is ready. Verify the codes sent to your email and phone."), message="Verification required")


@router.post("/send-code", response_model=ApiResponse[CodeSentResponse])
def send_client_code(payload: SendCodeRequest, db: DatabaseSession) -> ApiResponse[CodeSentResponse]:
    user = db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Account not found")
    _client_user(user)
    if payload.channel == "email" and user.email_verified_at is not None:
        raise HTTPException(status_code=400, detail="Email is already verified")
    if payload.channel == "phone" and user.phone_verified_at is not None:
        raise HTTPException(status_code=400, detail="Phone is already verified")
    code = _issue_code(db, user, payload.channel)
    return ApiResponse(data=_code_response(payload.channel, code), message=f"A {payload.channel} verification code was sent")


@router.post("/verify-code", response_model=ApiResponse[CodeVerificationResponse])
def verify_client_code(payload: VerifyCodeRequest, db: DatabaseSession) -> ApiResponse[CodeVerificationResponse]:
    user = db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Account not found")
    _client_user(user)
    code_record = db.scalar(select(VerificationCode).where(VerificationCode.user_id == user.id, VerificationCode.channel == payload.channel, VerificationCode.consumed_at.is_(None)).order_by(VerificationCode.created_at.desc()))
    if code_record is None or code_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="That code is expired. Request a new one")
    code_record.attempts += 1
    provider_verified = check_phone_code(user.phone or "", payload.code) if payload.channel == "phone" and twilio_configured() else verify_verification_code(payload.code, code_record.code_hash)
    if code_record.attempts > 5 or not provider_verified:
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code")
    code_record.consumed_at = datetime.now(timezone.utc)
    if payload.channel == "email":
        user.email_verified_at = datetime.now(timezone.utc)
    else:
        user.phone_verified_at = datetime.now(timezone.utc)
    user.is_verified = user.email_verified_at is not None and user.phone_verified_at is not None
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id)) if user.is_verified else None
    return ApiResponse(data=_verification_result(user, db, payload.channel, token), message="Verification complete" if token else f"{payload.channel.title()} verified")


@router.post("/login", response_model=ApiResponse[LoginResponse])
def client_login(payload: ClientLoginRequest, db: DatabaseSession) -> ApiResponse[LoginResponse]:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    _client_user(user)
    if user.email_verified_at is None or user.phone_verified_at is None:
        raise HTTPException(status_code=403, detail="Verify your email and phone number before signing in")
    return ApiResponse(data=LoginResponse(access_token=create_access_token(str(user.id)), user=_to_user_read(user, db)), message="Logged in successfully")


@router.get("/google/start")
def google_start() -> RedirectResponse:
    try:
        url = google_authorization_url(create_oauth_state())
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return RedirectResponse(url)


@router.get("/google/callback")
def google_callback(code: str, state: str, db: DatabaseSession) -> RedirectResponse:
    if not decode_oauth_state(state):
        raise HTTPException(status_code=400, detail="Invalid Google sign-in state")
    try:
        profile = exchange_google_code(code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Google sign-in could not be completed") from exc
    user = db.scalar(select(User).where(User.google_subject == profile["sub"])) or db.scalar(select(User).where(User.email == profile["email"]))
    if user is not None and user.is_superuser:
        raise HTTPException(status_code=409, detail="Use the admin sign-in for this account")
    if user is None:
        role = _client_role(db)
        user = User(first_name=profile["first_name"] or profile["email"].split("@", 1)[0], last_name=profile["last_name"], email=profile["email"], password_hash=hash_password(secrets.token_urlsafe(32)), phone=None, status="approved", is_active=True, is_verified=False, is_superuser=False, role_id=role.id, google_subject=profile["sub"], email_verified_at=datetime.now(timezone.utc))
        db.add(user)
    else:
        user.google_subject = profile["sub"]
        user.email_verified_at = user.email_verified_at or datetime.now(timezone.utc)
        user.role_id = user.role_id or _client_role(db).id
        user.status = "approved"
        user.is_active = True
    db.commit()
    db.refresh(user)
    if user.phone_verified_at is None:
        session = create_verification_session(str(user.id))
        return RedirectResponse(f"{settings.client_portal_url}/client/verify?session={session}&method=google")
    return RedirectResponse(f"{settings.client_portal_url}/client/dashboard?token={create_access_token(str(user.id))}")


@router.post("/google/phone/start", response_model=ApiResponse[CodeSentResponse])
def google_phone_start(payload: GooglePhoneStartRequest, db: DatabaseSession) -> ApiResponse[CodeSentResponse]:
    subject = decode_verification_session(payload.session)
    if not subject:
        raise HTTPException(status_code=400, detail="This verification session has expired")
    user = db.get(User, uuid.UUID(subject))
    if user is None:
        raise HTTPException(status_code=404, detail="Account not found")
    _client_user(user)
    user.phone = payload.phone
    db.commit()
    code = _issue_code(db, user, "phone")
    return ApiResponse(data=_code_response("phone", code), message="A phone verification code was sent")


@router.post("/google/phone/verify", response_model=ApiResponse[CodeVerificationResponse])
def google_phone_verify(payload: GooglePhoneVerifyRequest, db: DatabaseSession) -> ApiResponse[CodeVerificationResponse]:
    subject = decode_verification_session(payload.session)
    if not subject:
        raise HTTPException(status_code=400, detail="This verification session has expired")
    return verify_client_code(VerifyCodeRequest(user_id=uuid.UUID(subject), channel="phone", code=payload.code), db)


@portal_router.get("/overview", response_model=ApiResponse[ClientOverview])
def client_overview(current_user: CurrentUser, db: DatabaseSession) -> ApiResponse[ClientOverview]:
    _verified_client(current_user)
    projects = list(db.scalars(select(ClientProject).where(ClientProject.client_id == current_user.id).order_by(ClientProject.updated_at.desc())).all())
    messages = list(db.scalars(select(ClientMessage).where(ClientMessage.client_id == current_user.id).order_by(ClientMessage.created_at.desc()).limit(20)).all())
    project_reads = [ClientProjectRead.model_validate(project) for project in projects]
    message_reads = [ClientMessageRead(id=message.id, project_id=message.project_id, author_name=(db.get(User, message.author_id).first_name if db.get(User, message.author_id) else "TMI team"), body=message.body, created_at=message.created_at) for message in messages]
    return ApiResponse(data=ClientOverview(user=_to_user_read(current_user, db), projects=project_reads, messages=message_reads, unread_messages=0))


@portal_router.post("/messages", response_model=ApiResponse[ClientMessageRead], status_code=status.HTTP_201_CREATED)
def send_client_message(body: Annotated[str, Body(embed=True)], current_user: CurrentUser, db: DatabaseSession) -> ApiResponse[ClientMessageRead]:
    _verified_client(current_user)
    clean_body = body.strip()
    if not clean_body or len(clean_body) > 5000:
        raise HTTPException(status_code=400, detail="Message must contain between 1 and 5000 characters")
    message = ClientMessage(client_id=current_user.id, author_id=current_user.id, body=clean_body)
    db.add(message)
    db.commit()
    db.refresh(message)
    return ApiResponse(data=ClientMessageRead(id=message.id, project_id=None, author_name=f"{current_user.first_name} {current_user.last_name}".strip(), body=message.body, created_at=message.created_at), message="Message sent")
