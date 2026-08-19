# 01. `Task` Entity・enum設計

## 目的

タスクの中心となる`Task`エンティティと、時間帯・優先度を表すenumを作成する。

## 作成ファイル

- `src/main/java/com/tasknavi/backend/entity/TimeSlot.java`
- `src/main/java/com/tasknavi/backend/entity/Priority.java`
- `src/main/java/com/tasknavi/backend/entity/Task.java`

## 設計

### `TimeSlot`（取り組む時間帯／完了期限の時間帯で共用）

```java
public enum TimeSlot {
    MORNING, AFTERNOON, EVENING, NIGHT
}
```

日本語ラベル（朝/昼/夕/夜）への変換はフロント側の責務とし、バックエンドはenum名のみを扱う。

### `Priority`

```java
public enum Priority {
    HIGH, MEDIUM, LOW
}
```

### `Task`

| フィールド | 型 | 制約 |
|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `user` | `User` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)` |
| `type` | `String` | `@Column(nullable = false)`。自由入力のテキストタグ（固定カテゴリなし） |
| `title` | `String` | `@Column(nullable = false)`。課題名 |
| `timeSlot` | `TimeSlot` | `@Enumerated(EnumType.STRING) @Column(name = "time_slot")`。**nullable**（今日／今後どちらでも任意項目。期限切れ処理で未設定に戻す仕様＝§16もあるため、そもそも`nullable`である必要がある） |
| `dueDate` | `LocalDate` | `@Column(name = "due_date")`。DB上は**nullable**（Phase3の「今後のタスク」では任意になるため）だが、「今日のタスク」としてはDTO側で`@NotNull`の必須バリデーションをかける（[05_validation_required_fields.md](./05_validation_required_fields.md)） |
| `dueTimeSlot` | `TimeSlot` | `@Enumerated(EnumType.STRING) @Column(name = "due_time_slot")`。**nullable**（今日／今後どちらでも任意項目） |
| `priority` | `Priority` | `@Enumerated(EnumType.STRING)`。DB上はnullable可だが、「今日のタスク」としてはDTO側で必須バリデーションをかける（[05_validation_required_fields.md](./05_validation_required_fields.md)） |
| `sortOrder` | `Integer` | `@Column(name = "sort_order", nullable = false)`。ユーザーごとの表示順 |
| `createdAt` | `LocalDateTime` | `@Column(updatable = false)`。`@PrePersist`で設定（`User`と同じ方針） |
| `updatedAt` | `LocalDateTime` | `@PreUpdate`で更新 |

`createdAt`/`updatedAt`の実装は`User`エンティティと同じく`@PrePersist`/`@PreUpdate`に統一する（JPA Auditingは使わない）。

## 実装上のポイント

- Lombokは`@Getter` `@Setter` `@NoArgsConstructor`を付ける（`@Data`は避ける。`User`と同じ方針）。
- バリデーションアノテーションはEntityに付けない。DTO側で完結させる。
- 「今後のタスク」との区別カラム（例：`bucket`）は**本タスクでは追加しない**（README「要確認」および「今後のタスクとの関係」参照）。Phase3着手時に追加する。
- `completed`のような完了ステータスカラムも**本タスクでは追加しない**（Phase4のスコープ）。

## 受け入れ条件

- [ ] `./mvnw spring-boot:run` 起動時、Hibernateが`tasks`テーブルを自動生成する
- [ ] `tasks`テーブルに`user_id`の外部キー制約が張られている
- [ ] `time_slot` / `due_time_slot` / `priority` の各カラムがNULLを許容する（`sort_order`はNOT NULL）

## 依存関係

なし（Phase1の`User`エンティティが前提として存在すること）
