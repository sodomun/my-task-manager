import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { ApiError } from '../services/httpClient'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      await signup(email, password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '通信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <h1>サインアップ</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          パスワード（8文字以上）
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {errorMessage && (
          <p role="alert" className="auth-error">
            {errorMessage}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録する'}
        </button>
      </form>
      <p>
        既にアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </p>
    </main>
  )
}
