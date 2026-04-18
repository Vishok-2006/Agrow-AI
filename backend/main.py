from contextlib import asynccontextmanager
import logging
import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routes import auth, weather, chat, crop, health

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)


def _parse_cors_origins() -> list[str]:
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
    return origins or ["*"]


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("✅ Backend running successfully")
    if not os.getenv("WEATHER_API_KEY"):
        print("❌ WEATHER API KEY MISSING")
    else:
        print("✅ WEATHER API KEY LOADED")
    yield


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

cors_origins = _parse_cors_origins()
allow_credentials = settings.CORS_ALLOW_CREDENTIALS and cors_origins != ["*"]
if settings.CORS_ALLOW_CREDENTIALS and cors_origins == ["*"]:
    logger.warning("CORS credentials were disabled because wildcard origins are not valid with credentials.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

try:
    app.include_router(auth.router)
    app.include_router(weather.router)
    app.include_router(chat.router)
    app.include_router(crop.router)
    app.include_router(health.router)
except Exception as e:
    logger.error(f"Startup error: {e}")


@app.get("/")
async def root():
    return {"message": "Agrow AI API is running", "status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
