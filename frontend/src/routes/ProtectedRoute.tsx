import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** 未ログインならログイン画面へリダイレクトする。Phase1完了条件（ログインしないと入れない）の要。 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isRestoring } = useAuth()

  if (isRestoring) {
    return <p>読み込み中...</p>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
