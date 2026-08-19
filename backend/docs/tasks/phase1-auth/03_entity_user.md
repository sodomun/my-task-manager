# 03. `User` Entity設計

## 目的

認証の中心となる `User` エンティティを作成する。

## 作成ファイル

`src/main/java/com/tasknavi/backend/entity/User.java`

## 設計

| フィールド | 型 | 制約 |
|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `email` | `String` | `@Column(nullable = false, unique = true)` |
| `passwordHash` | `String` | `@Column(name = "password_hash", nullable = false)`。BCryptハッシュのみを格納。**平文は絶対に保持しない**。フィールド名を`password`ではなく`passwordHash`にすることで「中身はハッシュである」ことをコード上で自明にする |
| `createdAt` | `LocalDateTime` | `@Column(updatable = false)`。`@PrePersist`で設定する（下記参照。JPA Auditingは使わない） |
| `updatedAt` | `LocalDateTime` | `@PreUpdate`で更新する |

### createdAt / updatedAtの実装方針（確定）

`@PrePersist` / `@PreUpdate` を使う。Spring Data JPA Auditing（`@CreatedDate` + `@EnableJpaAuditing`）は同じ目的を達成できるが、`@EnableJpaAuditing`をメインクラスに追加する設定が別途必要になるため、今フェーズでは設定不要な`@PrePersist`/`@PreUpdate`に統一する。

```java
@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = this.createdAt;
}

@PreUpdate
protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

## 実装上のポイント（元の案からの補足）

- Lombokは `@Getter` `@Setter` に加えて、`@NoArgsConstructor`（JPAが必要とするデフォルトコンストラクタ）を付ける。`@Data` は `equals/hashCode` がリレーション経由で無限ループを起こすことがあるため、Entityでは避け、個別にアノテーションを付ける方が安全。
- **バリデーションアノテーション（`@Email` `@NotBlank` 等）はここには付けない**。Entityへの永続化前には既にDTO側でバリデーション済みという前提にする（`04_dto_auth`参照）。DB制約（`nullable=false`, `unique=true`）は最終防衛ラインとして残す。
- `passwordHash` フィールドを外部に一切返却しないよう、後続タスク（DTO/JSON変換）で担保する。EntityにJackson用の`@JsonIgnore`を付ける方法もあるが、今回はDTO層で完全に分離する方針を優先し、Entityを直接シリアライズしない設計にする。
- **将来拡張の見込み**: `docs/requirements.md` §18のユーザー情報設定（氏名変更など）に備え、将来`name`カラムが必要になる可能性がある。`ddl-auto=update`運用なので、その時にフィールドを追加すれば自動でカラムが追加される。今フェーズでは追加しない。

## 受け入れ条件

- [ ] `./mvnw spring-boot:run` 起動時、Hibernateが `users` テーブルを自動生成する（ログに `create table` または既存確認のSQLが出る）
- [ ] MySQL Workbenchで `users` テーブルに `email` のユニーク制約が付いていることを確認できる

## 依存関係

`01_database_setup`
