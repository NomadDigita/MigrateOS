"""Database engine and session dependency lifecycle."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import get_settings


def create_session_factory() -> sessionmaker[Session]:
    """Create a pool-backed session factory from validated configuration."""

    engine = create_engine(str(get_settings().database_url), pool_pre_ping=True)
    return sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


SessionLocal = create_session_factory()


def get_db_session() -> Generator[Session, None, None]:
    """Yield one transaction-scoped SQLAlchemy session per request."""

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
