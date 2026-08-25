from datetime import datetime, timedelta, timezone
from typing import Any
import hashlib
import hmac
import secrets

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = "HS256"

# bcrypt only ever considers the first 72 bytes of a password. passlib (used
# here previously) truncated silently; modern bcrypt raises instead. We keep the
# truncation so hashes created before this change still verify - and so a long
# password can never turn into a 500 at the login endpoint.
_BCRYPT_MAX_BYTES = 72


def _password_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            _password_bytes(plain_password), password_hash.encode("utf-8")
        )
    except ValueError:
        # Malformed/unrecognised hash in the database - treat as a failed login
        # rather than letting it surface as a server error.
        return False


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_verification_code(code: str) -> str:
    return hmac.new(settings.secret_key.encode(), code.encode(), hashlib.sha256).hexdigest()


def verify_verification_code(code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_verification_code(code), code_hash)


def create_oauth_state(expires_minutes: int = 10) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": secrets.token_urlsafe(18), "purpose": "google_oauth", "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_oauth_state(token: str) -> bool:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return False
    return payload.get("purpose") == "google_oauth"


def create_verification_session(subject: str, expires_minutes: int = 15) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "purpose": "phone_verification", "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_verification_session(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("purpose") != "phone_verification":
        return None
    return payload.get("sub")


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None
    return payload.get("sub")
