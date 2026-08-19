# 02. Request/Response DTO設計

## 目的

Controller/Serviceの境界を跨ぐDTOを用意する。`Task`エンティティを直接返却・受領しない。

## 作成ファイル

- `src/main/java/com/tasknavi/backend/dto/request/CreateTaskRequest.java`
- `src/main/java/com/tasknavi/backend/dto/request/UpdateTaskRequest.java`
- `src/main/java/com/tasknavi/backend/dto/request/ReorderTasksRequest.java`
- `src/main/java/com/tasknavi/backend/dto/response/TaskResponse.java`

## 設計

### `CreateTaskRequest` / `UpdateTaskRequest`

同じ形（`record`または`class`、Phase1の`SignupRequest`等に合わせる）。フィールドとバリデーションアノテーションは共通:

| フィールド | 型 | バリデーション |
|---|---|---|
| `type` | `String` | `@NotBlank` |
| `title` | `String` | `@NotBlank` |
| `timeSlot` | `TimeSlot` | 任意（アノテーションなし） |
| `dueDate` | `LocalDate` | `@NotNull`（[05_validation_required_fields.md](./05_validation_required_fields.md)で扱う） |
| `dueTimeSlot` | `TimeSlot` | 任意（アノテーションなし） |
| `priority` | `Priority` | `@NotNull`（[05_validation_required_fields.md](./05_validation_required_fields.md)で扱う） |

`CreateTaskRequest`と`UpdateTaskRequest`は現時点ではフィールドが完全に同じだが、Phase3で「今後のタスク」用に必須項目が変わる（`priority`等が任意になる）ことを見越して、**別クラスとして定義しておく**（共通化はPhase3の要件が見えてから検討する）。

### `ReorderTasksRequest`

```java
public record ReorderTasksRequest(
    @NotEmpty List<Long> orderedTaskIds
) {}
```

並び替え後の順序で並んだタスクIDの配列。詳細は[07_reorder_sort_order.md](./07_reorder_sort_order.md)。

### `TaskResponse`

| フィールド | 型 |
|---|---|
| `id` | `Long` |
| `type` | `String` |
| `title` | `String` |
| `timeSlot` | `TimeSlot`（null許容） |
| `dueDate` | `LocalDate`（null許容） |
| `dueTimeSlot` | `TimeSlot`（null許容） |
| `priority` | `Priority` |
| `sortOrder` | `Integer` |
| `createdAt` | `LocalDateTime` |
| `updatedAt` | `LocalDateTime` |

`userId`は含めない（レスポンスは常に「自分のタスク」なので不要。JWTの持ち主が誰かは呼び出し元が知っている）。

## 実装上のポイント

- `record`にするか通常クラスにするかは、既存の`SignupRequest`等のスタイルに合わせる。
- enum（`TimeSlot`/`Priority`）はそのままJSONのenum名文字列（例：`"MORNING"`）としてシリアライズ/デシリアライズされる（デフォルトのJackson挙動）。

## 受け入れ条件

- [ ] 4つのDTOクラスがコンパイルできる
- [ ] `CreateTaskRequest`/`UpdateTaskRequest`で`type`/`title`が空文字の場合にBean Validationが発火する

## 依存関係

`01_entity_task`（`TimeSlot`/`Priority` enumを参照するため）
