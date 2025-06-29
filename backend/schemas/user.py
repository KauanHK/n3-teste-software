from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class UserCreate(BaseModel):
    """Schema para criação de usuário (o que o cliente envia)"""
    name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema para atualização de usuário (o que o cliente envia)"""
    name: str | None = None
    email: EmailStr | None = None


class UserPublic(BaseModel):
    """Schema para exibir o usuário (o que a API retorna)"""
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes = True)
