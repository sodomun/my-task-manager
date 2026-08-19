# 05. 必須項目バリデーション（schedule.md 2-2）

## 目的

`docs/requirements.md` §4・§6・§7 の「今日のタスクでは種類・課題名・優先度・完了期限（日付）が必須」を、実際にバリデーションとして効かせる。`docs/schedule.md`のステップ2-2に対応。

## 変更ファイル

- `src/main/java/com/tasknavi/backend/dto/request/CreateTaskRequest.java`
- `src/main/java/com/tasknavi/backend/dto/request/UpdateTaskRequest.java`

## 作業内容

[02_dto_task.md](./02_dto_task.md)で定義した`CreateTaskRequest`/`UpdateTaskRequest`に、以下のBean Validationアノテーションが付いていることを確認・追記する。

```java
public record CreateTaskRequest(
    @NotBlank String type,
    @NotBlank String title,
    TimeSlot timeSlot,       // 任意
    @NotNull LocalDate dueDate,
    TimeSlot dueTimeSlot,    // 任意
    @NotNull Priority priority
) {}
```

- `type` / `title`：`@NotBlank`（空文字・null・空白のみを弾く）
- `priority` / `dueDate`：`@NotNull`
- `timeSlot` / `dueTimeSlot`：バリデーションアノテーション無し（今日／今後どちらでも任意項目。README「必須項目まとめ」参照）

Controller側は既に`@Valid @RequestBody`を付けているので（[04_service_controller_create_list.md](./04_service_controller_create_list.md)）、バリデーション違反時はPhase1の`GlobalExceptionHandler`が処理する`MethodArgumentNotValidException`のハンドラがそのまま効くはずである。専用のハンドラ追加は不要。

## 受け入れ条件

- [ ] `priority`を省略して`POST /api/tasks`を叩くと`400`とバリデーションエラーメッセージが返る
- [ ] `dueDate`を省略して`POST /api/tasks`を叩くと`400`とバリデーションエラーメッセージが返る
- [ ] `type`または`title`を空文字で送ると`400`が返る
- [ ] `timeSlot`/`dueTimeSlot`を省略しても`201`で作成できる

## 依存関係

`02_dto_task`, `04_service_controller_create_list`
