import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})



export const extractApiError = (error, fallbackMessage = 'The request could not be completed.') => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      fallbackMessage
    )
  }

  return error instanceof Error ? error.message : fallbackMessage
}

export const weatherService = {
  getWeather: (location = 'New Delhi') => api.get('/weather', { params: { location } }),
}

export const cropService = {
  getRecommendation: (data) => api.post('/crop-recommend', data),
}

export const chatService = {
  sendMessage: (message, history, userId) => api.post('/ai/chat', { message, history, user_id: userId }),
  getHistory: (userId) => api.get(`/chat-history?user_id=${userId}`),
}

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const statusService = {
  getHealth: () => api.get('/health'),
}

export default api
