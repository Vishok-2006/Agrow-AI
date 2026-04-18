import { createContext, useContext, useEffect, useState } from 'react'
import { authService, extractApiError } from '../services/api'

const AuthContext = createContext({})
const STORAGE_KEY = 'agrow-auth-session'

const normalizeError = (error, fallbackMessage) => ({
  message: extractApiError(error, fallbackMessage),
})

const getSavedUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // ignore write errors for unsupported browsers
  }
}

const clearUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore cleanup errors
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = getSavedUser()
    setUser(storedUser)
    setLoading(false)
  }, [])

  const persistUser = (payload) => {
    const user = payload?.user || payload?.data?.user
    const session = payload?.data?.session || payload?.session
    if (!user) {
      return null
    }

    const normalizedUser = {
      ...user,
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
    }

    setUser(normalizedUser)
    saveUser(normalizedUser)
    return normalizedUser
  }

  const signUp = async ({ email, password }) => {
    try {
      const response = await authService.register({ email, password })
      persistUser(response.data)
      return { data: response.data, error: null }
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error, 'Unable to create an account right now.'),
      }
    }
  }

  const signIn = async ({ email, password }) => {
    try {
      const response = await authService.login({ email, password })
      persistUser(response.data)
      return { data: response.data, error: null }
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error, 'Unable to sign in right now.'),
      }
    }
  }

  const signOut = async () => {
    setUser(null)
    clearUser()
    return { error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        signIn,
        signOut,
        signUp,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
