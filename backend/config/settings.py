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

    # Gemini / Google
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY", ""))

    # Weather
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY", ""))

    # Endee Vector DB
    ENDEE_URL: str = os.getenv("ENDEE_URL", "http://localhost:8080/api/v1")
    ENDEE_AUTH_TOKEN: str = os.getenv("ENDEE_AUTH_TOKEN", "")
    ENDEE_INDEX_NAME: str = os.getenv("ENDEE_INDEX_NAME", "agri_kb")
    ENDEE_TOP_K: int = int(os.getenv("ENDEE_TOP_K", "3"))
    ENDEE_TIMEOUT_SECONDS: float = float(os.getenv("ENDEE_TIMEOUT_SECONDS", "10"))
    ENDEE_SEARCH_EF: int = int(os.getenv("ENDEE_SEARCH_EF", "128"))
    ENDEE_EMBEDDING_MODEL: str = os.getenv("ENDEE_EMBEDDING_MODEL", "models/embedding-001")
    ENDEE_PREFILTER_CARDINALITY_THRESHOLD: int = int(
        os.getenv("ENDEE_PREFILTER_CARDINALITY_THRESHOLD", "10000")
    )
    ENDEE_FILTER_BOOST_PERCENTAGE: int = int(os.getenv("ENDEE_FILTER_BOOST_PERCENTAGE", "0"))
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
