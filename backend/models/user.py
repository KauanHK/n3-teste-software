from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from db.base import Base
from core.security import check_password_hash, generate_password_hash


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, index = True)
    email = Column(String, unique = True, index = True, nullable = False)
    hashed_password = Column(String, nullable = False)
    created_at = Column(DateTime, nullable = False, default = func.now())
    updated_at = Column(DateTime, nullable = False, default = func.now(), onupdate = func.now())

    def verify_password(self, password: str) -> bool:
        return check_password_hash(password, self.hashed_password)

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"
