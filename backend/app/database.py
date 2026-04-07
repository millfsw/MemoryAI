from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from contextlib import asynccontextmanager

from app.settings import settings

# Sync engine for migrations and CLI tools
engine = create_engine(
    settings.sync_database_url,
    echo=settings.DEBUG,
)

# Async engine for FastAPI application
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.DEBUG,
)


def create_db_and_tables():
    """Create database tables (synchronous, for migrations)."""
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def get_async_session():
    """Get async database session."""
    async with AsyncSession(async_engine) as session:
        yield session


def get_session():
    """Get synchronous database session."""
    with Session(engine) as session:
        yield session
