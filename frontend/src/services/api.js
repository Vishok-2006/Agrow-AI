import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$|$/, '') || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let logHandler = null

export const registerApiLogger = (handler) => {
  logHandler = handler
}

const writeLog = (level, message, payload) => {
  if (typeof logHandler === 'function') {
    logHandler({ level, message, payload })
  }
}

api.interceptors.request.use((config) => {
  writeLog('info', `API ${String(config.method || 'GET').toUpperCase()} ${config.baseURL}${config.url}`, {
    params: config.params,
    data: config.data,
  })
  return config
})

api.interceptors.response.use(
  (response) => {
    writeLog('success', `Response ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    writeLog('error', `Request failed ${error.config?.url || 'unknown'}`, {
      status: error.response?.status,
      detail: error.response?.data || error.message,
    })
    return Promise.reject(error)
  },
)

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
