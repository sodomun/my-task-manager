import { API_BASE_URL, handleResponse } from '../../../services/httpClient'

export interface AuthResponse {
  token: string
  email: string
}

export interface UserResponse {
  id: number
  email: string
}

export function signup(email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // json形式として受け取る
    body: JSON.stringify({ email, password }),
  }).then((res) => handleResponse<AuthResponse>(res)) // JavaScriptのオブジェクト・配列から, JSON文字列に変換
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((res) => handleResponse<AuthResponse>(res))
}

// token を渡したら, レスポンスとして email, id が返ってくる
export function fetchMe(token: string): Promise<UserResponse> {
  return fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<UserResponse>(res))
}
