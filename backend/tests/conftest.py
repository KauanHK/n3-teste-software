import pytest_asyncio
from typing import AsyncGenerator

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from main import app
from db.base import Base
from api.v1.endpoints.user_router import get_db


# --- Configuração do Banco de Dados de Teste ---
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo = False) # echo=False para testes mais limpos
TestingSessionLocal = sessionmaker(
    autocommit = False,
    autoflush = False,
    bind = engine,
    class_ = AsyncSession
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    
    # Cria todas as tabelas no banco de dados de teste antes de cada teste
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(transport = ASGITransport(app = app), base_url = "http://test") as ac:
        yield ac

    # Limpa as tabelas depois que o teste termina
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
