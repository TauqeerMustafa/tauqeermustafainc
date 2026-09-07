import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.rbac import ROLE_ADMIN, ROLE_EXEC, ROLE_TEAM_LEAD, get_user_permissions
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


def _role_slug(user: User) -> str | None:
    return user.role.slug if user.role is not None else None


def is_admin(user: User) -> bool:
    """A user is an admin via the superuser flag OR the ``admin`` role slug.

    Both spellings exist in the data: bootstrap accounts are created with
    ``is_superuser=True`` and no role row, while accounts provisioned through
    the admin UI get the ``admin`` role. Checking only one of them is what let
    real admins fail authorization on some endpoints but not others.
    """
    return bool(user.is_superuser) or _role_slug(user) == ROLE_ADMIN


def get_current_admin(current_user: CurrentUser) -> User:
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


CurrentAdmin = Annotated[User, Depends(get_current_admin)]


def get_current_manager(current_user: CurrentUser) -> User:
    """Admins plus leadership roles — the read audience for reporting views."""
    if is_admin(current_user) or _role_slug(current_user) in {ROLE_EXEC, ROLE_TEAM_LEAD}:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Manager privileges required",
    )


CurrentManager = Annotated[User, Depends(get_current_manager)]


def require_permission(*needed: str) -> Callable[..., User]:
    """Dependency factory: allow the request only if the user's role grants at
    least one of ``needed`` permission slugs. Returns the current user.

    Admins bypass the check, mirroring `can()` in the frontend's lib/rbac so the
    menu a user is shown always matches what the API will actually allow."""

    def dependency(current_user: CurrentUser, db: DatabaseSession) -> User:
        if is_admin(current_user):
            return current_user
        perms = get_user_permissions(db, current_user)
        if not any(slug in perms for slug in needed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
