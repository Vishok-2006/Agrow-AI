import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { registerApiLogger } from '../services/api'

const LogContext = createContext(null)

const MAX_LOGS = 80

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((entry) => {
    const nextEntry = {
      id: crypto.randomUUID(),
      level: entry.level || 'info',
      message: entry.message,
      payload: entry.payload ?? null,
      timestamp: new Date().toISOString(),
    }

    setLogs((current) => [nextEntry, ...current].slice(0, MAX_LOGS))
  }, [])

  useEffect(() => {
    registerApiLogger(addLog)
  }, [addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const value = useMemo(
    () => ({
      addLog,
      clearLogs,
      logs,
    }),
    [addLog, clearLogs, logs],
  )

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}

export const useLogs = () => {
  const context = useContext(LogContext)

  if (!context) {
    throw new Error('useLogs must be used within a LogProvider')
  }

  return context
}
