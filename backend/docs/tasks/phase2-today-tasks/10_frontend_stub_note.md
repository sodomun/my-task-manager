# 10. フロントエンド側スコープメモ（このファイルのみ backend/ の外の作業）

## 目的

`docs/schedule.md` Phase2完了条件「**今日のタスクを追加・編集・並び替えできる**」を満たすための、フロント側スコープをバックエンドAPIと対応づけておく。

詳細な設計方針は[`docs/frontend-architecture.md`](../../../../docs/frontend-architecture.md)を参照。実装は`frontend/src/features/todo/`配下に作る（[ディレクトリ構成（目標）](../../../../docs/frontend-architecture.md#2-ディレクトリ構成目標)）。

## バックエンドAPIとフロント実装の対応

| schedule.md | バックエンド | フロントエンド（`features/todo/`） |
|---|---|---|
| 2-1 | `POST /api/tasks`, `GET /api/tasks`（[04](./04_service_controller_create_list.md)） | タスクカードUI（一覧表示）、タスク追加フォーム |
| 2-2 | 必須項目バリデーション（[05](./05_validation_required_fields.md)） | 優先度・時間帯・期限の表示、入力UI（フォームエラー表示） |
| 2-3 | `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`（[06](./06_service_controller_update_delete.md)） | タスク選択→編集・削除操作のUI |
| 2-4 | `PUT /api/tasks/reorder`（[07](./07_reorder_sort_order.md)） | ドラッグ＆ドロップUI、並び替え確定時に`orderedTaskIds`を送信 |

## 実装上の注意

- `services/`（共通基盤）に`ApiError`/`handleResponse`が既にある（`features/auth`から移行予定、[frontend-architecture.md §6](../../../../docs/frontend-architecture.md#6-api通信層)）。`features/todo/services/taskService.ts`はこれを再利用する。
- `TimeSlot`/`Priority`はバックエンドでは英語のenum名（`MORNING`, `HIGH`等）でやり取りされる。日本語ラベル（朝/昼/夕/夜、高/中/低）への変換・逆変換はフロント側で行う（[01_entity_task.md](./01_entity_task.md)参照）。
- 並び替えAPIは「変更された1件」ではなく「現在表示している全件の並び替え後ID配列」を送る仕様（[07_reorder_sort_order.md](./07_reorder_sort_order.md)）。ドラッグ＆ドロップライブラリのonDropハンドラで、確定後の全件配列を組み立てて送信すること。

## Phase2でフロントに作らないもの

- タスク完了チェックボックス・完了済み一覧（Phase4）
- 「今後のタスク」一覧・今日への昇格（Phase3）
- ダッシュボード（Phase5）

## 依存関係

バックエンド側 `01`〜`09` が完了していること（特に`/api/tasks`のCRUD・並び替えがCORS込みで動作すること）
