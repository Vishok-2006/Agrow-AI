import logging

from fastapi import APIRouter, Query

from services.weather_service import get_weather as fetch_weather_service

router = APIRouter()
logger = logging.getLogger(__name__)


async def fetch_weather(location: str) -> dict:
    data = fetch_weather_service(location)
    weather_details = {
        "temperature": data["temperature"],
        "humidity": data["humidity"],
        "condition": data["condition"],
        "source": data["source"],
    }
    logger.info("Weather fetched for %s via %s", location, weather_details["source"])
    return weather_details


async def get_weather(location: str) -> dict:
    return await fetch_weather(location)


@router.get("/weather")
async def weather_endpoint(location: str = Query("Madurai", description="Location to fetch weather for")):
    return await get_weather(location)
