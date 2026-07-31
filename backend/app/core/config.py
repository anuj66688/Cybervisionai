import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CyberVision AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment configs
    ENV: str = "development"
    DEBUG: bool = True
    
    # Firebase configuration
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_API_KEY: str = "AIzaSyDgVbOcougSEn7C9t7GOT3MyvjarFxaFR4"
    
    # Ingestion variables
    NVD_API_KEY: Optional[str] = None

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        if isinstance(value, bool):
            return value
        if value is None:
            return True

        normalized = str(value).strip().lower()
        if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
            return True
        if normalized in {"0", "false", "no", "off", "release", "production", "prod"}:
            return False
        return value
    
    # Model config for loading from .env
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
