# Phase 2: 今日のタスク（コア機能） タスク一覧（バックエンド）

対応する仕様: [`docs/requirements.md` §4 今日のタスク〜§9 タスクの追加](../../../../docs/requirements.md#4-今日のタスク)
対応するロードマップ: [`docs/schedule.md` Phase 2](../../../../docs/schedule.md#phase-2今日のタスクコア機能目安-23週)

完了の目安（schedule.md より）: **今日のタスクを追加・編集・並び替えできる**

このドキュメントはバックエンド分のタスクのみを扱う。フロントエンド分は `docs/frontend-architecture.md` の `features/todo/` に対応させて別途進める（[10_frontend_stub_note.md](./10_frontend_stub_note.md)参照）。schedule.mdの2-1〜2-4という区切りに、下記タスクファイルを対応させている。

---

## アーキテクチャ方針（決定事項）

- **エンティティ**: `Task`を新設。所有者は`User`への`@ManyToOne`（`user_id`外部キー）。Phase1の`User`と同じく、Controller/Serviceの境界を跨ぐのは常にDTO。
- **時間帯・優先度**: `TimeSlot`（`MORNING`/`AFTERNOON`/`EVENING`/`NIGHT`）、`Priority`（`HIGH`/`MEDIUM`/`LOW`）をenumとして定義し、`@Enumerated(EnumType.STRING)`でDB保存する。日本語表示（朝/昼/夕/夜、高/中/低）はフロント側の責務とし、バックエンドはenum名（英語）でやり取りする。
- **必須項目の扱い**: `docs/requirements.md` §4・§6・§7 より、「今日のタスク」では **種類・課題名・優先度・完了期限（`dueDate`）が必須**。取り組む時間帯（`timeSlot`）と期限の時間帯（`dueTimeSlot`）は今日／今後どちらでも任意（未設定を許容する。期限切れ時に時間帯を未設定へ戻す仕様＝§16があるため、そもそも`nullable`である必要がある）。「今後のタスク」（Phase3）では`dueDate`も含め全て任意になる想定。
- **「今後のタスク」との関係（重要・意図的な保留）**: Phase3で「今後のタスク」も同じ`Task`テーブルを使う想定だが、今日／今後を区別するカラム（例：`bucket`のようなフィールド）は本Phaseでは追加しない。`ddl-auto=update`運用のため、Phase3着手時に追加すればよい。**本Phaseで作成されるレコードは全て「今日のタスク」として扱う。**
- **完了・削除の状態管理**: タスクの完了（§13〜15）は本Phaseのスコープ外（Phase4）。本Phaseでは`completed`のようなステータスカラムは追加しない。削除（本Phase該当）は物理削除で行う（完了済みタスクのような論理削除の概念がまだ無いため）。
- **並び順**: `sortOrder`（`Integer`）カラムをユーザーごとに保持する。新規作成時は「そのユーザーの現在の最大値+1」を割り当てる。並び替えは並び替え後のID配列を受け取り、インデックスをそのまま`sortOrder`として一括更新するAPIとする（詳細は[07_reorder_sort_order.md](./07_reorder_sort_order.md)）。
- **所有者チェック**: 他ユーザーのタスクへのアクセスは、存在の有無を漏らさないため **404 Not Found** として扱う（403は返さない）。Phase1の`GlobalExceptionHandler`に`TaskNotFoundException`のハンドリングを追加する。
- **バリデーション**: Phase1同様、DTO + Bean Validation (`@Valid`)。DB制約は最終防衛線。
- **スコープ外（意図的な後回し）**: タスク完了・復元・期限切れ処理（Phase4）、今後のタスク（Phase3）、ダッシュボード集計（Phase5）は本Phaseでは実装しない。

## パッケージ構成（追加分、`com.tasknavi.backend` 配下）

```text
entity/          Task, TimeSlot（enum）, Priority（enum）
dto/
  request/       CreateTaskRequest, UpdateTaskRequest, ReorderTasksRequest
  response/      TaskResponse
repository/       TaskRepository
exception/        TaskNotFoundException（既存のGlobalExceptionHandlerに追記）
service/          TaskService
controller/       TaskController
```

## タスクの依存順序

```text
01_entity_task ─┐
                 ├─→ 04_service_controller_create_list ─→ 05_validation_required_fields ─→ 06_service_controller_update_delete ─→ 07_reorder_sort_order ─→ 08_manual_verification ─→ 09_automated_tests
02_dto_task ─────┤
03_repository_task ┘

（10_frontend_stub_note は 09 の完了後、frontend/ 側で着手）
```

`04`（2-1: 基盤）が終わった時点で「タスクを追加すると一覧に出る」が動く。以降は`docs/schedule.md`の2-2〜2-4に1対1で対応する。

## タスクファイル一覧

| # | ファイル | schedule.md対応 | 内容 |
|---|---|---|---|
| 01 | [01_entity_task.md](./01_entity_task.md) | - | `Task` Entity・`TimeSlot`/`Priority` enum設計 |
| 02 | [02_dto_task.md](./02_dto_task.md) | - | Request/Response DTO設計 |
| 03 | [03_repository_task.md](./03_repository_task.md) | - | `TaskRepository` |
| 04 | [04_service_controller_create_list.md](./04_service_controller_create_list.md) | 2-1 | 作成API・一覧取得API |
| 05 | [05_validation_required_fields.md](./05_validation_required_fields.md) | 2-2 | 必須項目バリデーション（種類・課題名・優先度・完了期限） |
| 06 | [06_service_controller_update_delete.md](./06_service_controller_update_delete.md) | 2-3 | 更新API・削除API（所有者チェック含む） |
| 07 | [07_reorder_sort_order.md](./07_reorder_sort_order.md) | 2-4 | 並び替えAPI（`sortOrder`一括更新） |
| 08 | [08_manual_verification.md](./08_manual_verification.md) | - | 動作確認手順（curl） |
| 09 | [09_automated_tests.md](./09_automated_tests.md) | - | 自動テスト（単体・結合） |
| 10 | [10_frontend_stub_note.md](./10_frontend_stub_note.md) | - | フロント側スコープメモ（`features/todo/`） |

## 必須項目まとめ（確定事項）

| 項目 | 今日のタスク | 今後のタスク（Phase3） |
|---|---|---|
| 種類・課題名 | 必須 | 必須 |
| 優先度 | 必須 | 任意 |
| 完了期限（`dueDate`） | 必須 | 任意 |
| 取り組む時間帯（`timeSlot`） | 任意 | 任意 |
| 期限の時間帯（`dueTimeSlot`） | 任意 | 任意 |

`docs/requirements.md` §4・§6・§7・§10・§11 に反映済み。§11（今後→今日の昇格時の必須項目チェック）は「完了期限・優先度」のみが対象で、取り組む時間帯は対象外。
