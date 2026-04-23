import logging
from typing import Any
from fastapi import APIRouter, HTTPException
from models.schemas import CropRecommendationRequest
from services.nvidia_service import generate_ai_response
from services.supabase_service import supabase_service

router = APIRouter()
logger = logging.getLogger(__name__)

def get_rule_based_recommendation(soil: str, temp: float, humidity: float):
    soil = soil.lower()
    if "sandy" in soil:
        return "Watermelon" if temp > 25 else "Carrots"
    if "clay" in soil:
        return "Rice" if humidity > 70 else "Wheat"
    if "loamy" in soil:
        return "Tomato" if 20 <= temp <= 30 else "Maize"
    return "Millet"

async def generate_crop_recommendation(data: dict[str, Any]) -> dict[str, str]:
    temperature = float(data.get("temperature", 0))
    humidity = float(data.get("humidity", 0))
    soil = str(data.get("soil_type", "")).strip().lower()
    location = str(data.get("location", "unknown")).strip() or "unknown"

    if not soil:
        logger.warning("Soil type missing, using fallback soil type 'loamy'")
        soil = "loamy"

    # Rule-based fallback
    crop = get_rule_based_recommendation(soil, temperature, humidity)

    explanation = (
        f"{crop} suits {soil} soil with temp {temperature}°C and humidity {humidity}% in {location}."
    )

    prompt = (
        f"Explain why {crop} is a suitable crop for {soil} soil in {location} "
        f"with temperature {temperature}C and humidity {humidity}%. Keep it concise."
    )
    
    try:
        # Now awaiting the async AI response
        ai_output = await generate_ai_response(prompt)
        if ai_output:
            explanation = ai_output
    except Exception as e:
        logger.error(f"Failed to get AI explanation for crop: {str(e)}")

    return {
        "recommended_crop": crop,
        "explanation": explanation,
        "irrigation_advice": "Water early morning and monitor soil moisture.",
        "risk_alerts": "Monitor pests and humidity-related diseases.",
        "status": "success",
    }

async def build_crop_recommendation(payload: CropRecommendationRequest):
    # Await the now-async function
    result_data = await generate_crop_recommendation(payload.model_dump())

    if payload.user_id and supabase_service.connected:
        try:
            supabase_service.store_crop_request(
                payload.user_id,
                payload.model_dump(exclude={"user_id"}),
                str(result_data),
            )
        except Exception as e:
            logger.error(f"Failed to store crop request in Supabase: {str(e)}")

    return result_data

@router.post("/crop-recommend")
async def recommend_crop(request: CropRecommendationRequest):
    request_data = request.model_dump()
    if "temperature" not in request_data or "humidity" not in request_data:
        raise HTTPException(status_code=400, detail="Missing required fields")

    result_data = await build_crop_recommendation(request)
    logger.info(f"Crop recommendation prepared for {request.location}")
    return result_data
