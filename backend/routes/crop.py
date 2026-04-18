from typing import Any

from fastapi import APIRouter, HTTPException

from models.schemas import CropRecommendationRequest
from services.gemini_service import generate_ai_response
from services.supabase_service import supabase_service

router = APIRouter()


def get_rule_based_recommendation(soil: str, temp: float, humidity: float):
    soil = soil.lower()
    if "sandy" in soil:
        return "Watermelon" if temp > 25 else "Carrots"
    if "clay" in soil:
        return "Rice" if humidity > 70 else "Wheat"
    if "loamy" in soil:
        return "Tomato" if 20 <= temp <= 30 else "Maize"
    return "Millet"


def generate_crop_recommendation(data: dict[str, Any]) -> dict[str, str]:
    temperature = float(data.get("temperature", 0))
    humidity = float(data.get("humidity", 0))
    soil = str(data.get("soil_type", "")).strip().lower()
    location = str(data.get("location", "unknown")).strip() or "unknown"

    if not soil:
        print("ERROR: Soil type missing, using fallback soil type 'loamy'")
        soil = "loamy"

    if soil == "loamy":
        crop = "Tomato"
    elif soil == "clay":
        crop = "Rice"
    elif soil == "sandy":
        crop = "Groundnut"
    else:
        crop = "Maize"

    explanation = (
        f"{crop} suits {soil} soil with temp {temperature}°C and humidity {humidity}% in {location}."
    )

    prompt = (
        f"Explain why {crop} is a suitable crop for {soil} soil in {location} "
        f"with temperature {temperature}C and humidity {humidity}%. Keep it concise."
    )
    ai_output = generate_ai_response(prompt, [])
    if ai_output:
        explanation = ai_output

    return {
        "recommended_crop": crop,
        "explanation": explanation,
        "irrigation_advice": "Water early morning and monitor soil moisture.",
        "risk_alerts": "Monitor pests and humidity-related diseases.",
        "status": "success",
    }


async def build_crop_recommendation(payload: CropRecommendationRequest):
    result_data = generate_crop_recommendation(payload.model_dump())

    if payload.user_id and supabase_service.connected:
        supabase_service.store_crop_request(
            payload.user_id,
            payload.model_dump(exclude={"user_id"}),
            str(result_data),
        )

    return result_data


@router.post("/crop-recommend")
async def recommend_crop(request: CropRecommendationRequest):
    request_data = request.model_dump()
    if "temperature" not in request_data or "humidity" not in request_data:
        raise HTTPException(status_code=400, detail="Missing required fields")

    result_data = await build_crop_recommendation(request)
    print(f"[INFO] Crop recommendation prepared for {request.location}")
    return result_data
