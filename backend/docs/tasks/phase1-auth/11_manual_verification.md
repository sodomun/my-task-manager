# 11. 動作確認（手動テスト）

## 目的

Phase 1（バックエンド部分）が仕様通り動くことを、実装後にPostman/curl等で確認する。

## 確認シナリオ

### 1. サインアップ

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
- [ ] `201` とJWTが返る
- [ ] MySQL Workbenchで`users`テーブルにハッシュ化されたパスワードで1件登録されている

### 2. 重複サインアップ

同じリクエストをもう一度送る。
- [ ] `409` と`ErrorResponse`が返る

### 3. バリデーションエラー

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"123"}'
```
- [ ] `400` とバリデーションエラー内容（どの項目が不正か）が返る

### 4. ログイン成功

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
- [ ] `200` とJWTが返る

### 5. ログイン失敗

パスワードを間違えて送信。
- [ ] `401` と`ErrorResponse`が返る（メール存在有無を教えない汎用メッセージ）

### 6. 保護エンドポイントへの未認証アクセス

`GET /api/auth/me`（`10_controller_auth`で実装済み）を使う。`Phase 2`でタスクAPIができるまでは唯一の保護エンドポイントなので、使い捨てのエンドポイントを別途作る必要はない。

```bash
curl http://localhost:8080/api/auth/me
```
- [ ] トークンなしで`401`（JSON形式）が返る

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <ログインで取得したtoken>"
```
- [ ] トークン付きで`200`とユーザー情報が返る

### 7. 期限切れ・改ざんトークン

- [ ] `jwt.expiration-ms`を短く一時変更する等で期限切れを再現し、`401`が返ることを確認
- [ ] トークン文字列の一部を書き換えて送信し、`401`が返ることを確認

## 依存関係

`10_controller_auth` まで完了していること
