import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Phase1完了条件の確認用プレースホルダー画面。
 * 本実装（タスクカード・並び替え等）は docs/requirements.md §4 に基づき Phase2 で行う。
 */
export function TodayTasksPlaceholder() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <main className="auth-page">
      <h1>今日のタスク（Phase2で実装予定）</h1>
      <p>ログイン中: {user?.email}</p>
      <button type="button" onClick={logout}>
        ログアウト
      </button>

      {/*
        state.backgroundLocation に「今いる場所」を積んでおくと、App.tsx がそれを見て
        モーダル表示に切り替える。このLinkを踏まずに /example/1 を直接開いた場合は
        state が無いので通常の単独ページとして表示される。
      */}
      <p>
        <Link to="/example/1" state={{ backgroundLocation: location }}>
          モーダルルーティングのサンプルを開く
        </Link>
      </p>
    </main>
  )
}
