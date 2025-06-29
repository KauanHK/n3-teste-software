from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from repositories.user_repository import user_repository
from schemas.user import UserCreate, UserUpdate
from core.security import generate_password_hash


class UserService:

    async def create_user(self, db: AsyncSession, user_create: UserCreate):

        db_user = await user_repository.get_by_email(db, email = user_create.email)
        if db_user:
            print('email repetido')
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Email já cadastrado")
        
        return await user_repository.create(
            db = db,
            name = user_create.name,
            email = user_create.email,
            hashed_password = generate_password_hash(user_create.password)
        )

    async def update_user(self, db: AsyncSession, user_id: int, user_update: UserUpdate):

        db_user = await user_repository.get(db, user_id = user_id)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Usuário não encontrado")
        
        return await user_repository.update(db, user = db_user, updates = user_update)


user_service = UserService()
