import logging
import time
from typing import Any, Optional, cast, Dict
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from services.nvidia_service import generate_ai_response
from services.weather_service import get_weather
from services.supabase_service import supabase_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Simple rate limiting: user_id -> last_request_timestamp
_user_last_request: Dict[str, float] = {}
RATE_LIMIT_SECONDS = 3.0

WEATHER_KEYWORDS = ["weather", "temperature", "rain", "humidity", "forecast", "climate", "hot", "cold"]

async def prepare_ai_response(request: ChatRequest, history: list[dict]) -> str:
    """
    Analyzes intent and fetches context (weather) if needed before calling NVIDIA AI.
    """
    weather_context = ""
    
    # Simple intent detection for weather context
    if any(keyword in request.message.lower() for keyword in WEATHER_KEYWORDS):
        try:
            # Attempt to get weather for context
            location = "Madurai" # Default or extract from message
            weather_data = await get_weather(location)
            if weather_data and weather_data.get("source") != "fallback":
                weather_context = (
                    f"\n[Weather Context for {location}: "
                    f"Temp: {weather_data.get('temperature')}°C, "
                    f"Condition: {weather_data.get('condition')}]\n"
                )
                logger.info(f"Context-aware AI: Weather data integrated for {location}")
            else:
                weather_context = "\n[Weather data unavailable, using default regional conditions]\n"
        except Exception as e:
            logger.warning(f"Failed to fetch weather context for AI: {e}")

    full_prompt = f"{weather_context}{request.message}"
    
    return await generate_ai_response(full_prompt, history)

def persist_chat(user_id: Optional[str], message: str, response_text: str) -> None:
    if not user_id or not supabase_service.connected or user_id == "anonymous":
        return

    try:
        # Use 'messages' table for persistent chat history
        supabase_service.client.table("messages").insert({
            "user_id": user_id,
            "message": message,
            "response": response_text
        }).execute()
    except Exception as exc:
        logger.error("Failed to store chat for %s: %s", user_id, exc)


@router.post("/chat")
@router.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """
    Main AI Chat endpoint. Returns structured, context-aware agricultural advice.
    """
    user_id = request.user_id or "anonymous"
    now = time.time()
    
    # 1. Rate Limiting Check
    if user_id in _user_last_request:
        elapsed = now - _user_last_request[user_id]
        if elapsed < RATE_LIMIT_SECONDS:
            return {
                "reply": "⚠️ Please wait a few seconds before asking another question.",
                "status": "busy"
            }
    
    _user_last_request[user_id] = now

    try:
        logger.info(f"AI Request from {user_id}: {request.message[:50]}")
        
        # Format history
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Generate response with context
        response = await prepare_ai_response(request, history)
        
        # Persist to database (background)
        persist_chat(request.user_id, request.message, response)
        
        return {
            "reply": response,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Route /ai/chat Error: {str(e)}", exc_info=True)
        return {
            "reply": "AI service is temporarily unavailable. Please try again later.",
            "status": "error"
        }

@router.get("/chat-history")
async def get_history(user_id: str):
    """
    Retrieve user chat history from Supabase 'messages' table.
    """
    try:
        if not supabase_service.connected or user_id == "anonymous":
            return []
            
        res = supabase_service.client.table("messages")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", ascending=True)\
            .execute()
            
        # Format for frontend
        history = []
        for msg in res.data:
            history.append({"role": "user", "content": msg["message"]})
            history.append({"role": "assistant", "content": msg["response"]})
            
        return history
    except Exception as exc:
        logger.error("Fetching chat history failed: %s", exc)
        return []
