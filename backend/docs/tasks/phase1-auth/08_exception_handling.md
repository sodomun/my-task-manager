# 08. 例外処理（独自例外 + `@RestControllerAdvice`）

## 目的

エラー時に一貫したJSON形式（`ErrorResponse`）を返す司令塔を作る。

## 作成ファイル

```text
src/main/java/com/tasknavi/backend/exception/EmailAlreadyExistsException.java
src/main/java/com/tasknavi/backend/exception/GlobalExceptionHandler.java
src/main/java/com/tasknavi/backend/security/RestAuthenticationEntryPoint.java
```

## 設計

### 独自例外

- `EmailAlreadyExistsException extends RuntimeException`
  サインアップ時にメールアドレスが既に登録されている場合に使用。

- ログイン失敗（メール不一致・パスワード不一致）は**独自例外を作らず、Spring Securityの `BadCredentialsException`（`org.springframework.security.authentication`）をそのまま利用する**。元の案の「もともとあるクラスかライブラリから継承する」はここに該当する。認証情報の誤りをどちらが原因か特定できるメッセージを返さない（メールアドレス存在の有無を漏らさないセキュリティ配慮）。

### `GlobalExceptionHandler`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists(...) { ... } // 409 CONFLICT

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(...) { ... } // 401 UNAUTHORIZED

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(...) { ... } // 400 BAD_REQUEST
    // SignupRequest/LoginRequestの@Valid違反（必須項目未入力、メール形式不正など）はここに集約される

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(...) { ... } // 403 FORBIDDEN

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(...) { ... } // 500 INTERNAL_SERVER_ERROR
    // 想定外の例外もJSONで返し、スタックトレースはログにのみ出力してレスポンスには含めない
}
```

すべて `ErrorResponse`（`04_dto_auth`参照）を返す。

### `RestAuthenticationEntryPoint`

```java
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        // response.setStatus(401) + ErrorResponseをJSONで書き込む
    }
}
```

未認証アクセス（トークンなし／無効トークン）が保護エンドポイントに来たときに、Spring Securityのデフォルト（ログインページへのリダイレクト等）ではなくJSONの401を返すために `07_security_config` から登録する。

## 実装上のポイント

- `@ControllerAdvice` ではなく `@RestControllerAdvice` を使う（`@ResponseBody`が暗黙で付き、JSON返却のControllerAdvice向け）。元の案の「@ControllerAdviceで司令塔」を、REST API前提で `@RestControllerAdvice` に修正。

## 受け入れ条件

- [ ] 重複メールでサインアップすると409＋`ErrorResponse`が返る
- [ ] 誤ったパスワードでログインすると401＋`ErrorResponse`が返る（「メールが存在しない」と「パスワードが違う」でメッセージを変えない）
- [ ] 必須項目なしでサインアップすると400＋バリデーションエラー内容が返る
- [ ] トークンなしで保護エンドポイントにアクセスすると401＋`ErrorResponse`（HTMLではなくJSON）が返る

## 依存関係

`04_dto_auth`（`ErrorResponse`）
