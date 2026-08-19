# 06. Security基盤（PasswordEncoder / UserDetailsService / JWT）

## 目的

Spring SecurityがユーザーをJWTで認証できるようにするための部品を揃える。`07_security_config`から利用される。

## 作成ファイル

```text
src/main/java/com/tasknavi/backend/security/UserPrincipal.java
src/main/java/com/tasknavi/backend/security/CustomUserDetailsService.java
src/main/java/com/tasknavi/backend/security/JwtTokenProvider.java
src/main/java/com/tasknavi/backend/security/JwtAuthenticationFilter.java
```

## 設計

### `UserPrincipal`

`org.springframework.security.core.userdetails.UserDetails` を実装し、`User` エンティティの `id` / `email` / `passwordHash` をラップするクラス。認証後にController/Serviceから `userId` を取り出せるようにするため、Spring標準の `User` クラスではなく独自実装にする。

`User` エンティティから変換するための static factory メソッドを持たせる（`09_service_auth`・`CustomUserDetailsService`双方から使う）。

```java
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String passwordHash;

    private UserPrincipal(Long id, String email, String passwordHash) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash());
    }

    public Long getId() { return id; }

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return passwordHash; }

    // getAuthorities()は空リストでよい（今フェーズはロール未導入）
    // isAccountNonExpired / isAccountNonLocked / isCredentialsNonExpired / isEnabled は true 固定でよい
}
```

### `CustomUserDetailsService`

`UserDetailsService` を実装。`loadUserByUsername(String email)` で `UserRepository.findByEmail` を呼び、見つからなければ `UsernameNotFoundException` を投げ、見つかれば `UserPrincipal.from(user)` を返す。

コンストラクタインジェクション（`@RequiredArgsConstructor`）で `UserRepository` を注入する。

### `JwtTokenProvider`

- `application.properties` に持たせる設定値: `jwt.secret`（Base64エンコードした秘密鍵）、`jwt.expiration-ms`（例: `86400000` = 24時間）。
- **`jwt.secret`は256bit（32バイト）以上必須**（HS256アルゴリズムの要件。短い鍵だと`WeakKeyException`で起動時に落ちる）。生成例:
  ```bash
  openssl rand -base64 64
  ```
- `01_database_setup`と同様、**Gitにコミットせず**環境変数（`JWT_SECRET`）または`application-local.properties`経由で渡す。
- 提供するメソッド:
  - `generateToken(UserPrincipal principal): String`
  - `validateToken(String token): boolean`
  - `getEmailFromToken(String token): String`
- JWTのクレームには `sub`（email）と有効期限のみを含める。パスワード等の機密情報は入れない。

### `JwtAuthenticationFilter`

`OncePerRequestFilter` を継承。

1. `Authorization: Bearer <token>` ヘッダからトークンを取り出す
2. `JwtTokenProvider.validateToken` で検証
3. 有効なら `CustomUserDetailsService` でユーザーを読み込み、`SecurityContextHolder` に `Authentication` をセット
4. 例外は握りつぶさず、後段の `07_security_config` で設定する `AuthenticationEntryPoint` が401を返せるようにする（フィルタ内でレスポンスを直接書かない）

## 実装上のポイント

- 全クラスでコンストラクタインジェクション＋`@RequiredArgsConstructor`を使う（フィールド`@Autowired`は使わない）。
- **ログアウトについて**: JWTはステートレスなので、サーバー側に「ログアウトAPI」は作らない。ログアウトは**フロント側でトークンを破棄するだけ**で完結する（`13_frontend_stub_note`参照）。トークンの強制失効（ブラックリスト等）はPhase1のスコープ外とする。

## 受け入れ条件

- [ ] `JwtTokenProvider` の生成・検証がユニットテストで通る（有効なトークン／期限切れトークン／改ざんトークンの3パターン）
- [ ] 秘密鍵がソースコード・`application.properties`に直書きされていない

## 依存関係

`02_dependencies`, `05_repository_user`
