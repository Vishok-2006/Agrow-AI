const HISTORY_KEY = 'agrow_chat_history'

export const historyService = {
  getSessions: () => {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  },

  saveSession: (sessionId, messages) => {
    const sessions = historyService.getSessions()
    const index = sessions.findIndex(s => s.id === sessionId)
    
    const sessionData = {
      id: sessionId,
      lastUpdate: new Date().toISOString(),
      preview: messages[messages.length - 1]?.content.substring(0, 30) + '...',
      messages: messages
    }

    if (index > -1) {
      sessions[index] = sessionData
    } else {
      sessions.unshift(sessionData)
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 20))) // Keep last 20
  },

  getSession: (sessionId) => {
    const sessions = historyService.getSessions()
    return sessions.find(s => s.id === sessionId)
  },

  deleteSession: (sessionId) => {
    const sessions = historyService.getSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY)
  }
}
