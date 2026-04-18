import { extractApiError, weatherService } from './api'

export const FALLBACK_WEATHER = {
  condition: 'Cloudy',
  description: 'partly cloudy',
  humidity: 65,
  location: 'New Delhi',
  note: 'Weather data is temporarily unavailable and a fallback view is shown.',
  rainChance: '10%',
  temp: 28.5,
  windSpeed: 6.2,
}

export const normalizeWeatherData = (data, requestedLocation = FALLBACK_WEATHER.location) => ({
  condition: data?.condition || data?.weather?.[0]?.main || FALLBACK_WEATHER.condition,
  description:
    data?.description || data?.weather?.[0]?.description || data?.condition || FALLBACK_WEATHER.description,
  humidity: Number(data?.humidity ?? data?.main?.humidity ?? FALLBACK_WEATHER.humidity),
  location: data?.location || data?.name || requestedLocation,
  note: data?.note || null,
  rainChance: data?.rain_chance || FALLBACK_WEATHER.rainChance,
  temp: Number(data?.temp ?? data?.main?.temp ?? FALLBACK_WEATHER.temp),
  windSpeed: Number(data?.wind_speed ?? data?.wind?.speed ?? FALLBACK_WEATHER.windSpeed),
})

export const fetchWeather = async (location = FALLBACK_WEATHER.location) => {
  try {
    const response = await weatherService.getWeather(location)
    return normalizeWeatherData(response.data, location)
  } catch (error) {
    console.error('Error fetching weather data:', extractApiError(error))
    return {
      ...FALLBACK_WEATHER,
      location,
      note: 'Showing sample weather because the backend weather service is unavailable.',
    }
  }
}

export const fetchForecast = async (location = FALLBACK_WEATHER.location) => {
  const weather = await fetchWeather(location)
  return { list: [weather] }
}

export const fetchWeatherByCity = async (city) => fetchWeather(city)
