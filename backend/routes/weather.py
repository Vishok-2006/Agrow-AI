import logging
from fastapi import APIRouter, Query, HTTPException
from services.weather_service import get_weather as fetch_weather_data

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/weather")
async def weather_endpoint(location: str = Query("Madurai", description="Location to fetch weather for")):
    """
    Fetch weather for a location with caching and retry logic.
    """
    try:
        data = await fetch_weather_data(location)
        logger.info("Weather dispatched for %s (Source: %s)", location, data.get("source"))
        return data
    except Exception as e:
        logger.error(f"Weather endpoint failure: {str(e)}")
        return {
            "temperature": 28,
            "humidity": 65,
            "wind": 4.5,
            "rain": 0,
            "condition": "Clear",
            "source": "route-fallback"
        }
