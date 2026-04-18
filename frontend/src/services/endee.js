const rawEndeeUrl = (import.meta.env.VITE_ENDEE_URL || 'http://localhost:8080').replace(/\/+$/, '')

const apiBaseUrl = rawEndeeUrl.endsWith('/api/v1') ? rawEndeeUrl : `${rawEndeeUrl}/api/v1`
const healthUrl = `${apiBaseUrl.replace(/\/api\/v1$/, '')}/health`

export const endeeClient = {
  baseUrl: apiBaseUrl,
}

export const checkEndeeHealth = async () => {
  try {
    const response = await fetch(healthUrl)

    if (!response.ok) {
      return false
    }

    const payload = await response.json().catch(() => null)
    return payload?.status ? payload.status === 'ok' : true
  } catch (error) {
    console.error('Endee connection failed:', error instanceof Error ? error.message : error)
    return false
  }
}

export default endeeClient
