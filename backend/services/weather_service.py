import os

import requests


def get_weather(location: str = "Madurai"):
    try:
        api_key = os.getenv("WEATHER_API_KEY") or os.getenv("OPENWEATHER_API_KEY")

        if not api_key:
            raise Exception("Weather API key not found")

        url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": location,
            "appid": api_key,
            "units": "metric",
        }

        res = requests.get(url, params=params, timeout=5)
        data = res.json()

        if res.status_code != 200:
            raise Exception(data.get("message", "Weather API error"))

        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "condition": data["weather"][0]["description"],
            "source": "live",
        }

    except Exception as e:
        print("⚠️ WEATHER ERROR:", str(e))
        return {
            "temperature": 30,
            "humidity": 60,
            "condition": "fallback data",
            "source": "fallback",
        }
