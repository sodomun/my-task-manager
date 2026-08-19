# 04. 作成API・一覧取得API（schedule.md 2-1）

## 目的

「タスクを追加でき、一覧に表示される」が動く状態を作る。`docs/schedule.md`のステップ2-1に対応。

## 作成ファイル

- `src/main/java/com/tasknavi/backend/service/TaskService.java`
- `src/main/java/com/tasknavi/backend/controller/TaskController.java`

## 設計

### `TaskService`

コンストラクタインジェクション + `@RequiredArgsConstructor`（Phase1と同じ方針）。

```java
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository; // Userの参照取得用

    @Transactional
    public TaskResponse create(Long userId, CreateTaskRequest request) {
        User user = userRepository.getReferenceById(userId); // 存在確認はJWT認証済みなので不要
        int nextSortOrder = taskRepository.findMaxSortOrderByUserId(userId) + 1;

        Task task = new Task();
        task.setUser(user);
        task.setType(request.type());
        task.setTitle(request.title());
        task.setTimeSlot(request.timeSlot());
        task.setDueDate(request.dueDate());
        task.setDueTimeSlot(request.dueTimeSlot());
        task.setPriority(request.priority());
        task.setSortOrder(nextSortOrder);

        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(Long userId) {
        return taskRepository.findByUserIdOrderBySortOrderAsc(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
            task.getId(), task.getType(), task.getTitle(),
            task.getTimeSlot(), task.getDueDate(), task.getDueTimeSlot(),
            task.getPriority(), task.getSortOrder(),
            task.getCreatedAt(), task.getUpdatedAt()
        );
    }
}
```

`userRepository.getReferenceById(userId)`はDBアクセスを発生させずプロキシを取得する（JWT認証済みでユーザーの存在は保証されているため、わざわざ`findById`で取得し直さない）。

### `TaskController`

```java
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.create(principal.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(taskService.list(principal.getId()));
    }
}
```

`@AuthenticationPrincipal UserPrincipal principal`でJWTから復元したユーザーIDを取得する（Phase1の`AuthController#me`と同じパターン）。

## 受け入れ条件

- [ ] `POST /api/tasks`（要トークン）で種類・課題名・優先度を送るとタスクが作成され、`201`と作成内容が返る
- [ ] `GET /api/tasks`（要トークン）で自分のタスク一覧が`sortOrder`昇順で返る
- [ ] トークン無しでどちらのAPIを叩いても`401`が返る（既存の`SecurityConfig`/`JwtAuthenticationFilter`が効いていることの確認）

## 依存関係

`01_entity_task`, `02_dto_task`, `03_repository_task`
