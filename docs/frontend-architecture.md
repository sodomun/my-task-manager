# フロントエンド設計方針

`frontend/` (React + TypeScript + Vite) における実装方針のメモ。

Phaseが進むにつれて更新していく。

---

## 1. 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | React 19 |
| ビルドツール | Vite |
| 言語 | TypeScript |
| ルーティング | react-router-dom v7（`BrowserRouter`） |
| 状態管理 | Context API（現時点ではjotai等の追加ライブラリは導入しない） |
| APIアクセス | `fetch` ベースの自前クライアント層 |

---

## 2. ディレクトリ構成（目標）

「役割ごとの共通レイヤー」と「機能ごとのまとまり（`features/`）」を組み合わせた構成を採用する。

```text
frontend/src/
├── assets/          # 画像、アイコン、フォント
├── components/      # 特定機能に依存しない汎用UIパーツ（Button, Modalなど）
├── features/        # 機能単位の塊
│    ├── auth/
│    │    ├── components/  # ProtectedRoute など、認証専用のUI・ロジック
│    │    ├── hooks/       # useAuth（Context定義もここに同居させる）
│    │    ├── services/    # authService（サインアップ/ログイン/me取得）
│    │    └── types/       # 認証関連の型
│    └── todo/              # Phase2〜、タスク関連
│         ├── components/
│         ├── hooks/
│         └── types/
├── hooks/           # 特定featureに依存しない、アプリ全体向け汎用フック
├── pages/           # 各画面のルートコンポーネント（Routerと対応）
├── services/        # 複数featureで共有するAPI通信基盤（fetchラッパー、共通エラー型）
└── utils/           # 共通の純粋関数（日付フォーマットなど）
```

### 判断基準

- **components/ vs features/\*/components/**：どの機能からも使い回せる汎用パーツ（Button, Modal等）は`components/`。特定機能の中でしか使わないUI（例：`ProtectedRoute`は認証専用）は該当featureの`components/`に置く。
- **hooks/ vs features/\*/hooks/**：同上の基準。`useAuth`は認証機能そのものなので`features/auth/hooks/`に置く。将来、複数featureで使う汎用フック（`useDebounce`等）が出てきたらトップレベルの`hooks/`に置く。
- **services/ vs features/\*/services/**：`fetch`の共通ラッパーや共通エラー型（`ApiError`, `handleResponse`）などfeature非依存の通信基盤はトップレベルの`services/`。個別APIの呼び出し（`authService`等）はfeature配下。

### 現状コードとのギャップ（未移行）

以下は目標構成であり、実装（Phase1時点）はまだ移行していない。実際のリファクタは別途着手する。

| 現状のパス | 目標のパス |
|---|---|
| `context/AuthContext.tsx` | `features/auth/hooks/useAuth.ts`（Context定義ごと移動） |
| `routes/ProtectedRoute.tsx` | `features/auth/components/ProtectedRoute.tsx` |
| `api/authClient.ts` | `services/httpClient.ts`（共通部分）+ `features/auth/services/authService.ts`（個別API） |
| `components/Modal.tsx` | 変更なし（汎用UIのため`components/`のまま） |
| `pages/*.tsx` | 変更なし |

---

## 3. ルーティング

`react-router-dom` の `BrowserRouter` を `main.tsx` で設置し、ルート定義は `App.tsx` に集約する。

```tsx
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

- 認証不要ページ：`/login`, `/signup`
- 認証必須ページ：`ProtectedRoute`（`features/auth/components/`）でラップする（詳細は[4. 認証状態管理](#4-認証状態管理)）
- 存在しないパスは `*` で拾い `/` へ `replace` リダイレクト

### 3.1 URL連動モーダル（背景ページ + オーバーレイのパターン）

一覧ページなどからリンクで詳細を開く際、URLは遷移させつつ見た目はモーダルにする実装パターンを採用する（Instagram等のUXパターン）。

仕組み（`App.tsx` / `components/Modal.tsx`）：

1. リンク元で `navigate(to, { state: { backgroundLocation: location } })` のように、遷移前の場所を `state` に積んでおく。
2. `App.tsx` は `location.state.backgroundLocation` の有無で描画を出し分ける。
   - **背景側**：`backgroundLocation` があればそれを、なければ現在地をそのまま `<Routes location={...}>` に渡して描画する（＝一覧ページ等がそのまま裏に残る）。
   - **モーダル層**：`backgroundLocation` がある時だけ、実際のURLに対応する `<Routes>` をもう一段重ねて描画し、対象ページを `<Modal>` でラップする。
3. 直接アクセス・リロード時は `state` が空になる（`backgroundLocation` が `undefined`）ため、モーダルではなく単独ページとして通常表示される。
4. モーダルを閉じる操作（オーバーレイクリック・×ボタン）は `navigate(-1)` で、モーダルを開く前の履歴に戻る。

この仕組みにより、**同じページコンポーネント（例：`ExampleDetailPage`）を「一覧からのモーダル表示」と「直接アクセスの単独ページ表示」の両方で再利用できる。**

新しく「一覧→詳細」のようなモーダルUIを追加する場合はこのパターンを踏襲する。

このパターンはURLに状態を持たせたいモーダル（詳細ページ等）向け。削除確認ダイアログのような、URLを持つ必要のない一時的なモーダルは、素直にローカルの`useState`（またはfeature内のフック）で開閉管理すればよく、この仕組みに乗せる必要はない。

---

## 4. 認証状態管理

`features/auth/hooks/useAuth.ts`（移行前は`context/AuthContext.tsx`）で、Context定義・`AuthProvider`・`useAuth()`フックをまとめて提供する。

- 保持する状態：`user`（`{ email }`）、`token`、`isRestoring`
- トークンは `localStorage`（キー: `tasknavi.token`）に永続化し、リロードしてもログイン状態を維持する。
- **起動時の復元フロー**：保存済みトークンがあれば `/api/auth/me` を叩いて有効性を確認する。確認が終わるまで `isRestoring: true`。無効/期限切れなら `localStorage` を削除してログアウト状態にフォールバックする。
- `login` / `signup` / `logout` はいずれも `useAuth()` 経由で提供し、呼び出し元（ページ）はAPI呼び出しの詳細を意識しない。
- `logout` はJWTがステートレスであることを踏まえ、サーバー通知はせずローカルのトークン破棄のみ行う。
- `useAuth()` は `AuthProvider` の外で呼ばれた場合に例外を投げるガードを持つ。

状態管理ライブラリ（jotai等）の追加導入は現時点では見送る。認証状態は単一のグローバルステートで収まっており、Context APIで十分なため。複数のfeatureで細粒度なグローバルUIステート（URLを持たない一時的なモーダル状態など）が増えてきた場合に、部分導入を再検討する。

### 4.1 ProtectedRoute（認証ガード）

`features/auth/components/ProtectedRoute.tsx`（移行前は`routes/ProtectedRoute.tsx`）で、認証必須ページをラップする。

- `isRestoring` 中は「読み込み中...」を表示し、復元完了前に誤って `/login` へリダイレクトしないようにする。
- 復元完了後に `token` が無ければ `/login` へ `replace` リダイレクト。

新しく認証必須ページを追加する場合は、`App.tsx` のルート定義で `<ProtectedRoute>` でラップする。

---

## 5. カスタムフック

- **feature専用フック**（`features/auth/hooks/useAuth.ts`など）：そのfeatureの中でしか使わないロジックはfeature配下に閉じる。
- **アプリ全体向け汎用フック**（`hooks/`）：複数featureで使い回すフック（例：`useDebounce`, `useLocalStorage`）が実際に必要になったタイミングで切り出す。

現時点で無理に抽象化はせず、重複が実際に発生してから切り出す方針とする。

---

## 6. API通信層

- **`services/`（共通基盤）**：`fetch`の共通ラッパー、ベースURL解決、共通エラー型を置く。
  - ベースURLは環境変数 `VITE_API_BASE_URL`（未設定時は `http://localhost:8080` にフォールバック）。
  - バックエンドの `GlobalExceptionHandler` が返す `ErrorResponse`（`timestamp` / `status` / `error` / `message` / `path`）を型として受け取り、`ApiError`（`Error` を継承、`status` と `body` を持つ）にラップして投げる共通 `handleResponse<T>()` を提供する。
- **`features/*/services/`（個別API）**：各featureのAPI呼び出し（例：`features/auth/services/authService.ts`の`signup`/`login`/`fetchMe`）はここに置き、共通基盤の`handleResponse`等を利用する。
- 呼び出し元（フック・ページ）は `ApiError` を `catch` し、`error.message` をユーザー向けに表示する。

新しいfeatureのAPI（タスク関連など）を追加する場合は `features/todo/services/taskService.ts` のように、feature配下にファイルを作る。

---

## 7. 今後の検討事項

- 現状コード（`context/`, `routes/`, `api/`）を目標構成（`features/auth/`, `services/`）へ実際にリファクタするタイミング
- `hooks/` / トップレベル`services/`に何を置くかは、複数feature間の重複が発生してから確定させる
- Phase2でタスクの状態をどこで持つか（`features/todo/hooks/`内 / それ以外）
- URLを持たない一時的なモーダル（削除確認など）の実装パターンの確定
- ドラッグ＆ドロップ実装ライブラリの選定（[Phase2](./schedule.md#phase-2今日のタスクコア機能目安-23週)）
