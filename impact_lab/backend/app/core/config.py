import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Health OS Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Supabase Credentials (opcionales para modo local/sintético)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Salt para Hashing de RUT (Ley 21.719)
    RUT_SALT: str = os.getenv("RUT_SALT", "health_os_default_secret_salt_2026")
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
