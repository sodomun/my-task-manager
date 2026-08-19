# 08. 動作確認（手動テスト）

## 目的

Phase 2（バックエンド部分）が仕様通り動くことを、実装後にPostman/curl等で確認する。

事前に`POST /api/auth/login`でトークンを取得し、以下`<token>`に埋め込む。

## 確認シナリオ

### 1. タスク作成（2-1）

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"勉強","title":"英単語100個","priority":"HIGH","dueDate":"2026-08-25"}'
```
- [ ] `201` と作成内容（`sortOrder: 0`）が返る
- [ ] MySQL Workbenchで`tasks`テーブルに1件登録されている

もう1件追加する。
- [ ] `sortOrder: 1`で作成される（前回の最大値+1になっている）

### 2. 一覧取得（2-1）

```bash
curl http://localhost:8080/api/tasks -H "Authorization: Bearer <token>"
```
- [ ] `200` と、作成した2件が`sortOrder`昇順で返る

### 3. 必須項目バリデーション（2-2）

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"勉強","title":"英単語100個","dueDate":"2026-08-25"}'
```
- [ ] `priority`を省略すると`400`が返る

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"勉強","title":"英単語100個","priority":"HIGH"}'
```
- [ ] `dueDate`を省略すると`400`が返る

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"","title":"","priority":"HIGH","dueDate":"2026-08-25"}'
```
- [ ] `type`/`title`が空文字だと`400`が返る

### 4. 更新・削除（2-3）

```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"勉強","title":"英単語200個","priority":"MEDIUM","dueDate":"2026-08-26"}'
```
- [ ] `200` と更新後の内容が返る

```bash
curl -X DELETE http://localhost:8080/api/tasks/1 -H "Authorization: Bearer <token>"
```
- [ ] `204` が返り、一覧から消える

別ユーザーでログインし、そのトークンで最初のユーザーのタスクIDを指定して更新・削除を試す。
- [ ] どちらも`404`が返る（他ユーザーのタスクを操作できない）

### 5. 並び替え（2-4）

2件以上タスクがある状態で、順序を入れ替えた配列を送る。

```bash
curl -X PUT http://localhost:8080/api/tasks/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"orderedTaskIds":[3,2]}'
```
- [ ] `204`が返り、以後の`GET /api/tasks`が新しい順序で返る

IDを1件減らして送る。
- [ ] `400`が返る

### 6. 未認証アクセス

```bash
curl http://localhost:8080/api/tasks
```
- [ ] トークンなしで全エンドポイントが`401`を返す

## 依存関係

`07_reorder_sort_order` まで完了していること
