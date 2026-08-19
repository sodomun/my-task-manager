# 06. 更新API・削除API（schedule.md 2-3）

## 目的

タスクを編集・削除できるようにする。他ユーザーのタスクを操作できないことを保証する。`docs/schedule.md`のステップ2-3に対応。

## 作成ファイル

`src/main/java/com/tasknavi/backend/exception/TaskNotFoundException.java`

## 変更ファイル

- `src/main/java/com/tasknavi/backend/service/TaskService.java`
- `src/main/java/com/tasknavi/backend/controller/TaskController.java`
- `src/main/java/com/tasknavi/backend/exception/GlobalExceptionHandler.java`

## 設計

### `TaskNotFoundException`

`EmailAlreadyExistsException`と同じ方針（`RuntimeException`を継承する独自例外）。

```java
public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long taskId) {
        super("タスクが見つかりません (id: " + taskId + ")");
    }
}
```

### `GlobalExceptionHandler`への追記

`TaskNotFoundException` → `404 Not Found` を返すハンドラを追加する（既存の`EmailAlreadyExistsException`用ハンドラと同じ形）。

### `TaskService`

```java
@Transactional
public TaskResponse update(Long userId, Long taskId, UpdateTaskRequest request) {
    Task task = taskRepository.findByIdAndUserId(taskId, userId)
        .orElseThrow(() -> new TaskNotFoundException(taskId));

    task.setType(request.type());
    task.setTitle(request.title());
    task.setTimeSlot(request.timeSlot());
    task.setDueDate(request.dueDate());
    task.setDueTimeSlot(request.dueTimeSlot());
    task.setPriority(request.priority());
    // sortOrderはここでは変更しない（07_reorder_sort_orderの専用APIで扱う）

    return toResponse(task); // @Transactional配下なのでdirty checkingでUPDATEが発行される
}

@Transactional
public void delete(Long userId, Long taskId) {
    Task task = taskRepository.findByIdAndUserId(taskId, userId)
        .orElseThrow(() -> new TaskNotFoundException(taskId));
    taskRepository.delete(task);
}
```

**重要**：`findByIdAndUserId`を必ず使い、`findById`だけで済ませない。これを怠ると他ユーザーのタスクを操作できてしまう（IDOR）。

### `TaskController`

```java
@PutMapping("/{taskId}")
public ResponseEntity<TaskResponse> update(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long taskId,
        @Valid @RequestBody UpdateTaskRequest request) {
    return ResponseEntity.ok(taskService.update(principal.getId(), taskId, request));
}

@DeleteMapping("/{taskId}")
public ResponseEntity<Void> delete(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long taskId) {
    taskService.delete(principal.getId(), taskId);
    return ResponseEntity.noContent().build();
}
```

## 受け入れ条件

- [ ] 自分のタスクを`PUT /api/tasks/{id}`で更新できる
- [ ] 自分のタスクを`DELETE /api/tasks/{id}`で削除でき、`204`が返る
- [ ] 他ユーザーのタスクIDを指定すると、更新・削除どちらも`404`が返る（存在有無を漏らさない）
- [ ] 存在しないタスクIDを指定すると`404`が返る

## 依存関係

`01_entity_task`, `02_dto_task`, `03_repository_task`, `04_service_controller_create_list`
