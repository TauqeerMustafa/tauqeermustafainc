import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.rbac import get_user_permissions
from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User

DatabaseSession = Annotated[Session, Depends(get_session)]

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: DatabaseSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise unauthorized

    try:
        user_id = uuid.UUID(subject)
    except ValueError as exc:
        raise unauthorized from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise unauthorized

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_admin(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


CurrentAdmin = Annotated[User, Depends(get_current_admin)]


def require_permission(*needed: str) -> Callable[..., User]:
    """Dependency factory: allow the request only if the user's role grants at
    least one of ``needed`` permission slugs. Returns the current user."""

    def dependency(current_user: CurrentUser, db: DatabaseSession) -> User:
        perms = get_user_permissions(db, current_user)
        if not any(slug in perms for slug in needed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
