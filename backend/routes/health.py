import logging
import os

from fastapi import APIRouter

from services.supabase_service import supabase_service
from services.vector_service import vector_service

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

    endee_ok = await vector_service.check_health()

    return {
        "backend": "connected",
        "supabase": supabase_status,
        "weather": "connected" if os.getenv("WEATHER_API_KEY") else "disconnected",
        "endee": "connected" if endee_ok else "disconnected",
        "gemini": "connected" if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") else "disconnected",
    }
