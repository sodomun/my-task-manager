# 04. DTO設計（Request / Response）

## 目的

Controller/Serviceの境界で使うDTOを定義する。**Entityを直接HTTPの入出力に使わない**ための層。

## 作成ファイル

```text
src/main/java/com/tasknavi/backend/dto/request/SignupRequest.java
src/main/java/com/tasknavi/backend/dto/request/LoginRequest.java
src/main/java/com/tasknavi/backend/dto/response/AuthResponse.java
src/main/java/com/tasknavi/backend/dto/response/UserResponse.java
src/main/java/com/tasknavi/backend/dto/response/ErrorResponse.java
```

## 設計

### `SignupRequest`

```java
public record SignupRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 72) String password
) {}
```

- Bean Validationのアノテーション（`@NotBlank`, `@Email`, `@Size`）はここに付ける。**ここが元の案の「1.2 テーブルでバリデーション」を置き換える場所**。
- `password` の最大長72は、BCryptがそれ以上のバイト長を切り詰めてしまう仕様への配慮（72バイト制限）。
- `record` を使うことでLombokのGetter/Setterが不要になり不変DTOになる（Lombokは主にEntity/Serviceで使う方針でよい）。

### `LoginRequest`

```java
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
```

### `AuthResponse`

```java
public record AuthResponse(
    String token,
    String email
) {}
```

- ログイン・サインアップ成功時に返す。**パスワードやパスワードハッシュは絶対に含めない**。

### `UserResponse`

```java
public record UserResponse(
    Long id,
    String email
) {}
```

- `GET /api/auth/me`（`10_controller_auth`参照）で、ログイン状態復元のために現在のユーザー情報を返す際に使う。パスワードハッシュは含めない。

### `ErrorResponse`

```java
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path
) {}
```

- `08_exception_handling` の `GlobalExceptionHandler` が返すエラーレスポンスの統一フォーマット。

## 受け入れ条件

- [ ] 5つのDTOがコンパイルできる
- [ ] `SignupRequest`/`LoginRequest`にBean Validationアノテーションが付与されている

## 依存関係

なし（`01`〜`03`と並行して着手可能）
