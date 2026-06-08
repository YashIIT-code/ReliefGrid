import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./reliefgrid.db"
    SECRET_KEY: str = "supersecretkey"  # Development only
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 1 day
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

settings = Settings()
