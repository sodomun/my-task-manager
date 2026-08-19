# 05. `UserRepository`

## 目的

`User` エンティティの永続化アクセスを提供する。

## 作成ファイル

`src/main/java/com/tasknavi/backend/repository/UserRepository.java`

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

## 実装上のポイント

- `@Repository` アノテーションは省略可（`JpaRepository`を継承したインターフェースはSpring Data JPAが自動でBean登録するため）。元の案にあった「`@Repository`を付ける」は、独自実装クラスを書く場合以外は必須ではない点を補足。
- メソッド名だけでSpring Data JPAがクエリを自動生成するため、実装クラスは不要。

## 受け入れ条件

- [ ] アプリ起動時にBean登録エラーが出ない
- [ ] （`09`実装後）`findByEmail` で存在確認ができる

## 依存関係

`03_entity_user`
