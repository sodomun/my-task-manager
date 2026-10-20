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
    localStorage.getItem(TOKEN_STORAGE_KEY), // useState における "() =>" は初回ロード時に実行する関するを示す
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
      .catch(() => { // コールバック関数（引数として与えた関数は, コールバック関数）
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
  }, []) // 初期レンダリング時と同じ画面を使い回す

  const signup = useCallback(async (email: string, password: string) => { // メモ化. 関数の再生成を抑える. 初期関数で固定
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

  const value = useMemo<AuthContextValue>( // 計算結果のキャッシュ化
    () => ({ user, token, isRestoring, login, signup, logout }),
    [user, token, isRestoring, login, signup, logout],
  )

  // value にデータを流し込み, children に配信する.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext) // contet に value の情報（上記関数を参照）が格納されている
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
