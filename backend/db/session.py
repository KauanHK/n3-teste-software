from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.config import settings


engine = create_async_engine(settings.DATABASE_URL, echo = settings.DB_ECHO_LOG, future = True)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush = False,
    bind = engine,
    class_ = AsyncSession,
    expire_on_commit = False
)
