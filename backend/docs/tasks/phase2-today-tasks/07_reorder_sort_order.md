# 07. 並び替えAPI（schedule.md 2-4）

## 目的

ドラッグ＆ドロップで並び替えた順序を保存できるようにする。`docs/schedule.md`のステップ2-4に対応。

## 変更ファイル

- `src/main/java/com/tasknavi/backend/service/TaskService.java`
- `src/main/java/com/tasknavi/backend/controller/TaskController.java`

## 設計

フロント側はドラッグ＆ドロップ後の「並び替え後の全タスクIDの配列」をまとめて送る想定（1件ずつの順位変更ではなく、一括更新）。[02_dto_task.md](./02_dto_task.md)で定義した`ReorderTasksRequest`を使う。

### `TaskService`

```java
@Transactional
public void reorder(Long userId, ReorderTasksRequest request) {
    List<Task> tasks = taskRepository.findByUserIdOrderBySortOrderAsc(userId);
    Map<Long, Task> taskById = tasks.stream()
        .collect(Collectors.toMap(Task::getId, t -> t));

    List<Long> orderedIds = request.orderedTaskIds();

    // 送られてきたIDが「そのユーザーの全タスクID」と過不足なく一致するか検証する
    if (orderedIds.size() != tasks.size() || !taskById.keySet().containsAll(orderedIds)) {
        throw new IllegalArgumentException("並び替え対象のタスクIDが不正です");
    }

    for (int i = 0; i < orderedIds.size(); i++) {
        taskById.get(orderedIds.get(i)).setSortOrder(i);
    }
    // @Transactional配下のdirty checkingで一括UPDATEが発行される
}
```

`IllegalArgumentException`は既存の`GlobalExceptionHandler`に汎用ハンドラ（`400`）があるかを確認し、無ければ追加する（Phase1の実装を確認。無い場合は本タスクで追加する）。

### `TaskController`

```java
@PutMapping("/reorder")
public ResponseEntity<Void> reorder(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ReorderTasksRequest request) {
    taskService.reorder(principal.getId(), request);
    return ResponseEntity.noContent().build();
}
```

## 実装上のポイント

- 一部のタスクIDだけを送る「部分並び替え」は受け付けない（IDが1件でも欠けていたら`400`）。フロント側は常に「今表示している全件の並び替え後配列」を送る想定。
- 他ユーザーのタスクIDが紛れ込んでいた場合も、`taskById`（自分のタスクのみで構築）に存在しないので上記のバリデーションで弾かれる。

## 受け入れ条件

- [ ] 全タスクIDを並び替えた配列で`PUT /api/tasks/reorder`を叩くと`204`が返り、以後の`GET /api/tasks`が新しい順序を返す
- [ ] IDが1件不足した配列を送ると`400`が返る
- [ ] 他ユーザーのタスクIDを混ぜて送ると`400`が返る

## 依存関係

`01_entity_task`, `02_dto_task`, `03_repository_task`, `04_service_controller_create_list`
