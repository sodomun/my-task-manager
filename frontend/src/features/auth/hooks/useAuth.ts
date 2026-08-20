import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, login as loginRequest, signup as signupRequest } from '../services/authService'

const TOKEN_STORAGE_KEY = 'tasknavi.token'

interface AuthUser {
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  /** 起動直後、保存済みトークンの有効性を /api/auth/me で確認している間 true */
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsRestoring(false)
      return
    }
    fetchMe(token)
      .then((me) => setUser({ email: me.email }))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsRestoring(false))
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
    setToken(response.token)
    setUser({ email: response.email })
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    const response = await signupRequest(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
    setToken(response.token)
    setUser({ email: response.email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isRestoring, login, signup, logout }),
    [user, token, isRestoring, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
