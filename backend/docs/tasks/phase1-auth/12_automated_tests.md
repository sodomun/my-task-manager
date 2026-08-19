# 12. 自動テスト

## 目的

`pom.xml`には既に `spring-boot-starter-data-jpa-test` / `spring-boot-starter-security-test` / `spring-boot-starter-validation-test` / `spring-boot-starter-webmvc-test` が入っており、自動テストを書く前提の構成になっている。`11_manual_verification`の手動確認だけで終わらせず、主要シナリオを自動テスト化する。

## 作成ファイル

```text
src/test/java/com/tasknavi/backend/security/JwtTokenProviderTest.java
src/test/java/com/tasknavi/backend/service/AuthServiceTest.java
src/test/java/com/tasknavi/backend/controller/AuthControllerTest.java
```

## 設計

### `JwtTokenProviderTest`（単体テスト）

- 有効なトークンを生成→検証できる
- 期限切れトークンは`validateToken`が`false`を返す
- 改ざんされたトークン（署名不一致）は`validateToken`が`false`を返す
- テスト用の`jwt.secret`は本番用と別の値を`application.properties`（testスコープ）に用意する

### `AuthServiceTest`（単体テスト、Mockito）

- `UserRepository` / `PasswordEncoder` / `AuthenticationManager` / `JwtTokenProvider` をモック化
- 正常系: `signup`が`existsByEmail=false`のとき保存処理を呼ぶこと
- 異常系: `signup`が`existsByEmail=true`のとき`EmailAlreadyExistsException`を投げること（DB保存を試みないこと）
- `login`が認証成功時にトークンを含む`AuthResponse`を返すこと

### `AuthControllerTest`（結合テスト、`@SpringBootTest` + `MockMvc`）

`11_manual_verification`のcurlシナリオをMockMvcで自動化する。

- `POST /api/auth/signup` 正常系 → `201`
- `POST /api/auth/signup` 重複メール → `409`
- `POST /api/auth/signup` バリデーション違反 → `400`
- `POST /api/auth/login` 正常系 → `200`＋トークン
- `POST /api/auth/login` 誤パスワード → `401`
- `GET /api/auth/me` トークンなし → `401`
- `GET /api/auth/me` トークンあり → `200`

- テスト用DBは本番の`tasknavi`と分ける。`application-test.properties`で別スキーマ（例: `tasknavi_test`）を指定するか、Testcontainers導入を検討する（後者は学習コストが上がるため、Phase1では別スキーマ方式で十分）。
- 各テストメソッドの後にユーザーテーブルをクリーンアップする（`@Transactional`をテストクラスに付けてロールバックさせるのが簡単）。

## 受け入れ条件

- [ ] `./mvnw test` が全て通る
- [ ] `11_manual_verification`の主要シナリオ（1, 2, 3, 4, 5, 6）が自動テストでカバーされている

## 依存関係

`10_controller_auth`
