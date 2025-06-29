from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user import UserCreate, UserPublic, UserUpdate
from services.user_service import user_service
from db.session import SessionLocal
from repositories.user_repository import user_repository


router = APIRouter()


async def get_db():
    async with SessionLocal() as db:
        yield db


@router.post("/", response_model = UserPublic, status_code = status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    return await user_service.create_user(db = db, user_create = user)


@router.get("/", response_model = list[UserPublic])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    users = await user_repository.get_all(db, skip = skip, limit = limit)
    return users


@router.get("/{user_id}", response_model = UserPublic)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    
    user = await user_repository.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "User not found"
        )
    
    return user
    

@router.put("/{user_id}", response_model = UserPublic)
async def update_user(user_id: int, user: UserUpdate, db: AsyncSession = Depends(get_db)):
    return await user_service.update_user(db, user_id, user)


@router.delete("/{user_id}", status_code = status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):

    user = await user_repository.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "User not found"
        )
    
    await user_repository.delete(db, user)
    return {"detail": "User deleted successfully"}
