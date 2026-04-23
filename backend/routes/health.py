import logging
import os

from fastapi import APIRouter

from services.supabase_service import supabase_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    try:
        supabase_service.check_connection()
        supabase_status = "connected"
    except Exception as exc:
        logger.error("Supabase health check failed: %s", exc)
        supabase_status = "disconnected"

    return {
        "backend": "connected",
        "supabase": supabase_status,
        "weather": "connected" if os.getenv("WEATHER_API_KEY") else "disconnected",
        "gemini": "connected" if os.getenv("GEMINI_API_KEY") else "disconnected",
    }
