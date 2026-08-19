# 09. 自動テスト

## 目的

`08_manual_verification`の手動確認だけで終わらせず、主要シナリオを自動テスト化する。Phase1の`AuthControllerTest`等と同じ構成に合わせる。

## 作成ファイル

```text
src/test/java/com/tasknavi/backend/service/TaskServiceTest.java
src/test/java/com/tasknavi/backend/controller/TaskControllerTest.java
```

## 設計

### `TaskServiceTest`（単体テスト、Mockito）

- `TaskRepository` / `UserRepository` をモック化
- `create`：`sortOrder`が「既存の最大値+1」で作成されること（既存タスク無しの場合は`0`になること）
- `update`：他ユーザーのタスクIDを渡すと`TaskNotFoundException`を投げること
- `delete`：他ユーザーのタスクIDを渡すと`TaskNotFoundException`を投げること
- `reorder`：IDの過不足がある配列を渡すと`IllegalArgumentException`を投げること
- `reorder`：正しい配列を渡すと各タスクの`sortOrder`がインデックス通りに更新されること

### `TaskControllerTest`（結合テスト、`@SpringBootTest` + `MockMvc`）

`08_manual_verification`のcurlシナリオをMockMvcで自動化する。2人分のユーザー（`user-a@example.com`, `user-b@example.com`）を用意し、他ユーザーのタスクへの操作を検証する。

- `POST /api/tasks` 正常系 → `201`
- `POST /api/tasks` `priority`欠如 → `400`
- `POST /api/tasks` `dueDate`欠如 → `400`
- `POST /api/tasks` `timeSlot`/`dueTimeSlot`欠如 → `201`（任意項目のため作成できる）
- `GET /api/tasks` 自分のタスクのみ`sortOrder`昇順で返る（他ユーザーのタスクが混ざらないこと）
- `PUT /api/tasks/{id}` 正常系 → `200`
- `PUT /api/tasks/{id}` 他ユーザーのタスク → `404`
- `DELETE /api/tasks/{id}` 正常系 → `204`
- `DELETE /api/tasks/{id}` 他ユーザーのタスク → `404`
- `PUT /api/tasks/reorder` 正常系 → `204`、以後の一覧取得順序が反映されていること
- `PUT /api/tasks/reorder` ID不足 → `400`
- 全エンドポイント、トークンなし → `401`

Phase1の`AuthControllerTest`と同様、テスト用DB（`tasknavi_test`等）を使い、各テストは`@Transactional`でロールバックさせる。

## 受け入れ条件

- [ ] `./mvnw test` が全て通る
- [ ] `08_manual_verification`の主要シナリオが自動テストでカバーされている
- [ ] 「他ユーザーのタスクを操作できない」ケースが単体・結合の両方でカバーされている

## 依存関係

`07_reorder_sort_order`
