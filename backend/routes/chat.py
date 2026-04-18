import logging
from typing import Any, Optional, cast

from fastapi import APIRouter, HTTPException

from config.settings import settings
from models.schemas import ChatRequest, CropRecommendationRequest
from routes.crop import build_crop_recommendation
from routes.weather import get_weather
from services.gemini_service import generate_ai_response
from services.supabase_service import supabase_service
from services.vector_service import vector_service

router = APIRouter()
logger = logging.getLogger(__name__)

WEATHER_INTENT_KEYWORDS = {"temperature", "weather", "rain", "humidity", "forecast", "wind"}
CROP_INTENT_KEYWORDS = {"crop", "recommend", "fertilizer", "soil", "seed", "farming"}


def detect_intent(message: str) -> str:
    normalized = message.lower()
    if any(word in normalized for word in WEATHER_INTENT_KEYWORDS):
        return "weather"
    if any(word in normalized for word in CROP_INTENT_KEYWORDS):
        return "crop"
    return "ai"


def extract_location(message: str) -> str:
    lowered = message.lower()
    markers = [" in ", " at ", " for "]
    for marker in markers:
        if marker in lowered:
            location = message[lowered.rfind(marker) + len(marker):].strip(" ?.!,")
            if location:
                return location.title()
    return settings.WEATHER_DEFAULT_LOCATION


def build_crop_payload(message: str, user_id: Optional[str]) -> CropRecommendationRequest:
    return CropRecommendationRequest(
        humidity=65,
        location=extract_location(message),
        temperature=28,
        soil_type="Loamy",
        user_id=user_id or "anonymous",
    )


async def prepare_ai_response(request: ChatRequest, history: list[dict]) -> str:
    context = ""
    search_result = await vector_service.query_endee(
        request.message,
        index_name=settings.ENDEE_INDEX_NAME,
        top_k=settings.ENDEE_TOP_K,
    )

    if search_result.results:
        context = vector_service.build_context(search_result.results)
        logger.info("Using Endee results")
    elif search_result.unavailable:
        logger.warning("Vector DB unavailable")
        logger.info("Fallback to LLM")
    elif search_result.error:
        logger.error("Endee search failed without availability fallback: %s", search_result.error)
    else:
        logger.info("Endee returned no usable results; proceeding without vector context")

    prompt_with_context = (
        f"Use the following Endee context first when it is relevant.\n\nCONTEXT:\n{context}\n\nUSER QUERY: {request.message}"
        if context
        else request.message
    )
    return generate_ai_response(prompt_with_context, history)


def persist_chat(user_id: Optional[str], message: str, response_text: str) -> None:
    if not user_id or not supabase_service.connected:
        return

    try:
        supabase_service.store_chat(user_id, message, response_text)
    except Exception as exc:
        logger.error("Failed to store chat for %s: %s", user_id, exc)


@router.post("/chat")
@router.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    history = [{"role": msg.role, "content": msg.content} for msg in request.history]
    response = await prepare_ai_response(request, history)
    persist_chat(request.user_id, request.message, response)
    return {
        "response": response,
        "status": "success"
    }


@router.get("/chat-history")
async def get_history(user_id: str):
    try:
        if not supabase_service.connected:
            return []
        history = cast(Any, supabase_service.get_chat_history(user_id))
        if isinstance(history, list):
            return history
        return history.data if hasattr(history, "data") else []
    except Exception as exc:
        logger.error("Fetching chat history failed: %s", exc)
        raise HTTPException(status_code=500, detail="Unable to fetch chat history") from exc
