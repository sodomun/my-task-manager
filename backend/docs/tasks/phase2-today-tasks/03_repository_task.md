# 03. `TaskRepository`

## 目的

`Task`のCRUDと、ユーザーごとの一覧取得・並び順の最大値取得を行うリポジトリを作成する。

## 作成ファイル

`src/main/java/com/tasknavi/backend/repository/TaskRepository.java`

## 設計

```java
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderBySortOrderAsc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(MAX(t.sortOrder), -1) FROM Task t WHERE t.user.id = :userId")
    int findMaxSortOrderByUserId(Long userId);
}
```

- `findByIdAndUserId`：所有者チェックを兼ねた取得。更新・削除の前段で使う（[06_service_controller_update_delete.md](./06_service_controller_update_delete.md)）。
- `findMaxSortOrderByUserId`：新規作成時に「現在の最大値+1」を割り当てるために使う。レコードが無い場合は`-1`を返すようにし、呼び出し側で`+1`すれば`0`から始まる。

## 受け入れ条件

- [ ] `findByUserIdOrderBySortOrderAsc`で、あるユーザーのタスクが`sortOrder`昇順で取得できる
- [ ] `findByIdAndUserId`で、他ユーザーのタスクIDを渡すと空の`Optional`が返る

## 依存関係

`01_entity_task`
