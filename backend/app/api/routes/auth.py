from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DatabaseSession
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UpdateProfileRequest, UserRead
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        name=f"{user.first_name} {user.last_name}".strip(),
        email=user.email,
        role="admin" if user.is_superuser else "member",
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/login", response_model=ApiResponse[LoginResponse])
def login(payload: LoginRequest, db: DatabaseSession) -> ApiResponse[LoginResponse]:
    user = db.scalar(select(User).where(User.email == payload.email))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    expires_minutes = 60 * 24 * 14 if payload.remember else None
    token = create_access_token(str(user.id), expires_minutes=expires_minutes)

    return ApiResponse(
        data=LoginResponse(access_token=token, user=_to_user_read(user)),
        message="Logged in successfully",
    )


@router.get("/me", response_model=ApiResponse[UserRead])
def me(current_user: CurrentUser) -> ApiResponse[UserRead]:
    return ApiResponse(data=_to_user_read(current_user))


@router.put("/me", response_model=ApiResponse[UserRead])
def update_me(
    payload: UpdateProfileRequest, db: DatabaseSession, current_user: CurrentUser
) -> ApiResponse[UserRead]:
    if payload.name:
        parts = payload.name.strip().split(" ", 1)
        current_user.first_name = parts[0]
        current_user.last_name = parts[1] if len(parts) > 1 else ""

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
    return ApiResponse(data=_to_user_read(current_user), message="Profile updated")
