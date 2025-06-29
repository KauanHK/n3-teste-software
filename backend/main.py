from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.router import api_router
from db.base import Base
from db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:
        # Cria as tabelas do banco de dados
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield

    print("Finalizando a aplicação...")


app = FastAPI(lifespan = lifespan)

origins = [
    "http://localhost",
    "http://localhost:5173", # A origem do seu front-end React com Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Permite as origens da lista
    allow_credentials=True, # Permite cookies (se aplicável)
    allow_methods=["*"],    # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Permite todos os cabeçalhos
)

app.include_router(api_router, prefix = "/api/v1")
