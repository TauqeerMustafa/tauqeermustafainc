from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Remote Postgres providers (Supabase, RDS, etc.) require SSL; local dev DBs
# typically don't have it configured at all, so only force it for non-local hosts.
_connect_args: dict = {}
if "localhost" not in settings.database_url and "127.0.0.1" not in settings.database_url:
    _connect_args["sslmode"] = "require"

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_session() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def dispose_engine() -> None:
    engine.dispose()
