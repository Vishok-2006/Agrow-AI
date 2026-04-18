import { chatService, extractApiError } from './api'

const FALLBACK_CHAT_RESPONSE =
  'The AI service is unavailable, so this response is a temporary fallback. Focus on soil moisture, morning irrigation, and quick pest checks after humid weather.'

export const generateAgrowAdvice = async (weatherData) => ({
  crop_recommendation: `${weatherData?.condition || 'Current'} conditions are suitable for resilient short-duration crops such as tomato, millet, or maize.`,
  farming_tips: 'Inspect drainage, mulch exposed soil, and scout leaves for early signs of stress after rainfall.',
  irrigation_advice: 'Water early in the morning and adjust the frequency based on field moisture instead of a fixed schedule.',
  risk_alerts: 'Rapid swings in humidity and temperature can increase disease pressure, so monitor the crop canopy closely.',
})

export const chatWithAgrowAI = async (query, history = [], userId = 'agrow-user') => {
  try {
    const response = await chatService.sendMessage(query, history, userId)
    return response.data?.response || FALLBACK_CHAT_RESPONSE
  } catch (error) {
    console.error('Agrow AI chat error:', extractApiError(error))
    return FALLBACK_CHAT_RESPONSE
  }
}
