from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DatabaseSession
from app.core.rbac import get_user_permissions
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UpdateProfileRequest, UserRead
from app.schemas.common import ApiResponse
from app.schemas.crm import RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_read(user: User, db: DatabaseSession) -> UserRead:
    if user.role is not None:
        role_slug = user.role.slug
    else:
        role_slug = "admin" if user.is_superuser else "member"
    return UserRead(
        id=user.id,
        name=f"{user.first_name} {user.last_name}".strip(),
        email=user.email,
        role=role_slug,
        phone=user.phone,
        status=user.status,
        permissions=sorted(get_user_permissions(db, user)),
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


_STATUS_LOGIN_ERROR = {
    "pending": "Your account is awaiting admin approval.",
    "rejected": "Your registration was not approved.",
    "suspended": "This account has been suspended.",
}


@router.post("/register", response_model=ApiResponse[UserRead], status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DatabaseSession) -> ApiResponse[UserRead]:
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    parts = payload.name.strip().split(" ", 1)
    user = User(
        first_name=parts[0],
        last_name=parts[1] if len(parts) > 1 else "",
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        status="pending",
        is_active=False,  # gate login until an admin approves
        is_verified=False,
        is_superuser=False,
        role_id=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ApiResponse(
        data=_to_user_read(user, db),
        message="Registration received. An admin will review your account shortly.",
    )


@router.post("/login", response_model=ApiResponse[LoginResponse])
def login(payload: LoginRequest, db: DatabaseSession) -> ApiResponse[LoginResponse]:
    user = db.scalar(select(User).where(User.email == payload.email))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    message = _STATUS_LOGIN_ERROR.get(user.status)
    if message is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    expires_minutes = 60 * 24 * 14 if payload.remember else None
    token = create_access_token(str(user.id), expires_minutes=expires_minutes)

    return ApiResponse(
        data=LoginResponse(access_token=token, user=_to_user_read(user, db)),
        message="Logged in successfully",
    )


@router.get("/me", response_model=ApiResponse[UserRead])
def me(current_user: CurrentUser, db: DatabaseSession) -> ApiResponse[UserRead]:
    return ApiResponse(data=_to_user_read(current_user, db))


@router.put("/me", response_model=ApiResponse[UserRead])
def update_me(
    payload: UpdateProfileRequest, db: DatabaseSession, current_user: CurrentUser
) -> ApiResponse[UserRead]:
    if payload.name:
        parts = payload.name.strip().split(" ", 1)
        current_user.first_name = parts[0]
        current_user.last_name = parts[1] if len(parts) > 1 else ""

    if payload.phone is not None:
        phone = payload.phone.strip()
        if phone != (current_user.phone or ""):
            current_user.phone = phone or None
            # A new number has not been proven yet, so drop the old proof.
            current_user.phone_verified_at = None

    if payload.new_password:
        if not payload.current_password or not verify_password(
            payload.current_password, current_user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        current_user.password_hash = hash_password(payload.new_password)

    db.commit()
    db.refresh(current_user)
    return ApiResponse(data=_to_user_read(current_user, db), message="Profile updated")
