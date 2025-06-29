from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8"
    )

    DB_ECHO_LOG: bool = False
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/dbname"


settings = Settings()
