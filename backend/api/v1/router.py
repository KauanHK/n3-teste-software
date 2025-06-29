from fastapi import APIRouter
from api.v1.endpoints import user_router

api_router = APIRouter()
api_router.include_router(user_router.router, prefix = "/users", tags = ["users"])
