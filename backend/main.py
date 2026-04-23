from contextlib import asynccontextmanager
import logging
import os

from dotenv import load_dotenv

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.settings import settings
from routes import auth, weather, ai, crop, health

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("✅ Backend running successfully")
    
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    if not nvidia_key:
        print("❌ CRITICAL: NVIDIA_API_KEY not configured!")
    else:
        print("✅ NVIDIA_API_KEY loaded")

    weather_key = os.getenv("WEATHER_API_KEY")
    if not weather_key:
        print("⚠️  WEATHER_API_KEY not configured (optional for some features)")
    else:
        print("✅ WEATHER_API_KEY loaded")
    yield


# Initialize FastAPI app
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

# CRITICAL: Add HTTP middleware to handle OPTIONS requests FIRST
@app.middleware("http")
async def fix_options_requests(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(
            status_code=200,
            content={"message": "OK"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Max-Age": "3600",
            },
        )
    return await call_next(request)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    app.include_router(auth.router)
    app.include_router(weather.router)
    app.include_router(ai.router)
    app.include_router(crop.router)
    app.include_router(health.router)
except Exception as e:
    logger.error(f"Startup error: {e}")


@app.get("/")
async def root():
    return {"message": "Agrow AI API is running", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
