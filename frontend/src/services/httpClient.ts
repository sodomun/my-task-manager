export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.status = status
    this.body = body
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // レスポンスがJSONでない場合は汎用メッセージにフォールバック
    }
    throw new ApiError(
      response.status,
      body?.message ?? `リクエストに失敗しました (status: ${response.status})`,
      body,
    )
  }
  return response.json() as Promise<T>
}

export async function handleVoidResponse(response: Response): Promise<void> {
  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // ignore
    }
    throw new ApiError(
      response.status,
      body?.message ?? `リクエストに失敗しました (status: ${response.status})`,
      body,
    )
  }
}
