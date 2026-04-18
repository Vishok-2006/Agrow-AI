import { cropService, extractApiError } from './api'

export const FALLBACK_RECOMMENDATION = {
  crop_recommendation: 'Tomato is a practical recommendation for warm weather and loamy soil.',
  explanation: 'This fallback recommendation keeps the interface usable when the crop API is unavailable.',
  irrigation_advice: 'Use light irrigation early in the morning and re-check soil moisture before watering again.',
  note: 'Showing a fallback crop recommendation while the backend service is unavailable.',
  recommendedCrop: 'Tomato',
  risk_alerts: 'Watch for humidity spikes that can increase fungal pressure after cloudy days.',
}

const normalizeRecommendation = (data) => ({
  crop_recommendation:
    data?.crop_recommendation ||
    (data?.recommended_crop
      ? `${data.recommended_crop} is recommended for the current soil and weather conditions.`
      : FALLBACK_RECOMMENDATION.crop_recommendation),
  explanation: data?.explanation || FALLBACK_RECOMMENDATION.explanation,
  irrigation_advice: data?.irrigation_advice || FALLBACK_RECOMMENDATION.irrigation_advice,
  note: data?.note || null,
  recommendedCrop: data?.recommended_crop || FALLBACK_RECOMMENDATION.recommendedCrop,
  risk_alerts: data?.risk_alerts || FALLBACK_RECOMMENDATION.risk_alerts,
})

export const getAndSaveRecommendation = async ({
  humidity = 65,
  location = 'New Delhi',
  soilType = 'Loamy',
  temperature = 28.5,
  userId = 'agrow-user',
} = {}) => {
  try {
    const response = await cropService.getRecommendation({
      humidity,
      location,
      soil_type: soilType,
      temperature,
      user_id: userId,
    })

    return normalizeRecommendation(response.data)
  } catch (error) {
    console.error('Error in recommendation service:', extractApiError(error))
    return {
      ...FALLBACK_RECOMMENDATION,
      note: 'Showing a sample crop recommendation because the backend service is unavailable.',
    }
  }
}

export const getUserRecommendations = async () => []
