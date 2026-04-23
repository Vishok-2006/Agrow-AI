import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Agrow AI API"
    VERSION: str = "1.0.0"

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # NVIDIA AI
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")

    # Weather
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY", ""))


    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    )
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

    WEATHER_DEFAULT_LOCATION: str = os.getenv("WEATHER_DEFAULT_LOCATION", "Tamil Nadu")
    WEATHER_TIMEOUT_SECONDS: float = float(os.getenv("WEATHER_TIMEOUT_SECONDS", "10"))
    SUPABASE_HEALTH_TABLE: str = os.getenv("SUPABASE_HEALTH_TABLE", "test")

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
