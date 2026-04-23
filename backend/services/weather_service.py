import os
import asyncio
import logging
import time
from typing import Dict, Optional
import httpx

logger = logging.getLogger(__name__)

# In-memory cache and last known good data
_weather_cache: Dict[str, Dict] = {}
_last_known_good: Dict[str, Dict] = {}
CACHE_EXPIRATION = 600  # 10 minutes

async def get_weather(location: str = "Madurai"):
    location_key = location.lower().strip()
    now = time.time()

    # 1. Check Cache
    if location_key in _weather_cache:
        cached_data = _weather_cache[location_key]
        if now - cached_data["timestamp"] < CACHE_EXPIRATION:
            logger.info(f"Returning cached weather for {location}")
            return cached_data["data"]

    # 2. Fetch Live Data with Retries
    api_key = os.getenv("WEATHER_API_KEY") or os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.error("Weather API key not found")
        return _get_fallback(location_key)

    url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
    }

    async with httpx.AsyncClient() as client:
        for attempt in range(3):
            try:
                logger.info(f"Fetching weather for {location} (Attempt {attempt + 1})")
                res = await client.get(url, params=params, timeout=10.0)
                
                if res.status_code == 200:
                    data = res.json()
                    
                    # Parse as per reliability requirements
                    raw_temp = data.get("main", {}).get("temp")
                    raw_humidity = data.get("main", {}).get("humidity")
                    
                    # Safety check for NaN/None
                    def safe_val(val, default=0):
                        try:
                            if val is None or str(val).lower() == "nan":
                                return default
                            return float(val)
                        except:
                            return default

                    temp = safe_val(raw_temp, 28)
                    humidity = safe_val(raw_humidity, 65)
                    wind = safe_val(data.get("wind", {}).get("speed"), 4.5)
                    rain = safe_val(data.get("rain", {}).get("1h"), 0)
                    
                    weather_data = {
                        "location": location,
                        "temperature": temp,
                        "humidity": humidity,
                        "wind": wind,
                        "rain": rain,
                        "condition": data["weather"][0]["main"] if data.get("weather") else "Clear",
                        "source": "live",
                    }
                    
                    # Update cache and last known good
                    _weather_cache[location_key] = {"timestamp": now, "data": weather_data}
                    _last_known_good[location_key] = weather_data
                    return weather_data
                
                elif res.status_code == 404:
                    logger.warning(f"Location not found: {location}")
                    break
                
                else:
                    logger.error(f"Weather API error {res.status_code}: {res.text}")

            except (httpx.ConnectError, httpx.ConnectTimeout) as e:
                logger.warning(f"DNS/Connection error for {location}: {str(e)}")
            except Exception as e:
                logger.error(f"Unexpected error fetching weather: {str(e)}")
            
            if attempt < 2:
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff

    # 3. Final Fallback
    return _get_fallback(location_key)

def _get_fallback(location_key: str):
    if location_key in _last_known_good:
        logger.info(f"Returning last known good weather for {location_key}")
        data = _last_known_good[location_key].copy()
        data["source"] = "cached-fallback"
        return data
    
    logger.info(f"Returning static fallback weather for {location_key}")
    return {
        "temperature": 28,
        "humidity": 65,
        "wind": 4.5,
        "rain": 0,
        "condition": "Clear",
        "source": "static-fallback",
    }
