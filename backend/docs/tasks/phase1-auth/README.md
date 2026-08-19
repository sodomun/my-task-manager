# Phase 1: 認証 タスク一覧

対応する仕様: [`docs/requirements.md` §25 認証](../../../../docs/requirements.md#25-認証)
対応するロードマップ: [`docs/schedule.md` Phase 1](../../../../docs/schedule.md#phase-1認証目安-12週)

完了の目安（schedule.md より）: **ログインしないと「今日のタスク」画面に入れない状態が作れる**

---

## アーキテクチャ方針（決定事項）

- **認証方式**: JWT（ステートレス）。ログイン成功時にJWTを発行し、以降は `Authorization: Bearer <token>` ヘッダで送信する。
- **スキーマ管理**: `spring.jpa.hibernate.ddl-auto=update`。MySQL Workbench側では空のデータベース作成のみ行い、テーブル定義は `@Entity` から自動生成する。
- **バリデーション**: DB制約（NOT NULL, UNIQUE等）はデータ整合性の最終防衛線として付けるが、アプリケーションレベルのバリデーションは **DTO + Bean Validation (`@Valid`)** で行う。
- **DI方針**: コンストラクタインジェクション＋Lombok `@RequiredArgsConstructor`（`final`フィールド）。フィールド `@Autowired` は使わない。
- **レイヤー間の受け渡し**: Controller/Serviceの境界を跨ぐのは常にDTO。`User` Entityをそのまま返却・受領しない（パスワードハッシュ漏洩防止）。Entityのパスワードフィールドは`passwordHash`と命名し、中身がハッシュであることをコード上で自明にする。
- **ログアウト**: JWTはステートレスなのでサーバー側にログアウトAPIは作らない。フロント側でトークンを破棄するだけで完結する（トークンの強制失効はPhase1のスコープ外）。
- **スコープ外（意図的な後回し）**: ログイン試行のレート制限・ブルートフォース対策、パスワードリセット、メール確認、リフレッシュトークンはPhase1では実装しない。

## パッケージ構成（`com.tasknavi.backend` 配下）

```text
entity/          User
dto/
  request/       SignupRequest, LoginRequest
  response/      AuthResponse, ErrorResponse
repository/       UserRepository
security/         JwtTokenProvider, JwtAuthenticationFilter,
                  UserPrincipal, CustomUserDetailsService
config/           SecurityConfig
exception/        EmailAlreadyExistsException, GlobalExceptionHandler,
                  RestAuthenticationEntryPoint
service/          AuthService
controller/       AuthController
```

## タスクの依存順序

```text
01_database_setup ─┐
                    ├─→ 03_entity_user ─→ 05_repository_user ─┐
02_dependencies ────┘                                          │
                                                                 ├─→ 09_service_auth ─→ 10_controller_auth ─→ 11_manual_verification ─→ 12_automated_tests
04_dto_auth ─────────────────────────────────────────────────┘                │
                                                                                 │
06_security_core ─→ 07_security_config ─────────────────────────────────────────┘
08_exception_handling ──────────────────────────────────────────────────────────┘

（13_frontend_stub_note は 12 の完了後、frontend/ 側で着手）
```

上から順に着手すればよいが、`06`〜`08`（security基盤・例外処理）は `09`（service）より前に完成させておくこと。

## タスクファイル一覧

| # | ファイル | 内容 |
|---|---|---|
| 01 | [01_database_setup.md](./01_database_setup.md) | MySQLデータベース作成・Spring Boot接続設定 |
| 02 | [02_dependencies.md](./02_dependencies.md) | JWTライブラリ追加（pom.xml） |
| 03 | [03_entity_user.md](./03_entity_user.md) | `User` Entity設計 |
| 04 | [04_dto_auth.md](./04_dto_auth.md) | Request/Response DTO設計 |
| 05 | [05_repository_user.md](./05_repository_user.md) | `UserRepository` |
| 06 | [06_security_core.md](./06_security_core.md) | PasswordEncoder / UserDetailsService / JWT発行・検証 |
| 07 | [07_security_config.md](./07_security_config.md) | `SecurityFilterChain` / CORS / 401ハンドリング |
| 08 | [08_exception_handling.md](./08_exception_handling.md) | 独自例外 + `@RestControllerAdvice` |
| 09 | [09_service_auth.md](./09_service_auth.md) | `AuthService`（signup / login） |
| 10 | [10_controller_auth.md](./10_controller_auth.md) | `AuthController`（REST エンドポイント、`/me`含む） |
| 11 | [11_manual_verification.md](./11_manual_verification.md) | 動作確認手順（curl） |
| 12 | [12_automated_tests.md](./12_automated_tests.md) | 自動テスト（単体・結合） |
| 13 | [13_frontend_stub_note.md](./13_frontend_stub_note.md) | フロント側スコープメモ（Phase1完了条件用） |
