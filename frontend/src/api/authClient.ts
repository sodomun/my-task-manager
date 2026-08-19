const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export interface AuthResponse {
  token: string
  email: string
}

export interface UserResponse {
  id: number
  email: string
}

interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

/** バックエンドの GlobalExceptionHandler が返す ErrorResponse をラップした例外 */
export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // レスポンスがJSONでない場合は無視して汎用メッセージにフォールバックする
    }
    throw new ApiError(
      response.status,
      body?.message ?? `リクエストに失敗しました (status: ${response.status})`,
      body,
    )
  }
  return response.json() as Promise<T>
}

export function signup(email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((res) => handleResponse<AuthResponse>(res))
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((res) => handleResponse<AuthResponse>(res))
}

export function fetchMe(token: string): Promise<UserResponse> {
  return fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<UserResponse>(res))
}
