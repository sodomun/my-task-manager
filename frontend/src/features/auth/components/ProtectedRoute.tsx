import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/** 未ログインならログイン画面へリダイレクトする。 */
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
