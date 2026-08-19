/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** バックエンドAPIのベースURL。未設定時は http://localhost:8080 を使う */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
