# 10. `AuthController`

## 目的

サインアップ・ログインをHTTP経由で呼び出せるようにする。

## 作成ファイル

`src/main/java/com/tasknavi/backend/controller/AuthController.java`

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

```java
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new UserResponse(principal.getId(), principal.getUsername()));
    }
```

- `/me` はJWTが有効な間、フロント側がログイン状態を復元する（ページリロード時など）ために使う。**Phase1のスコープに含める**（`11_manual_verification`のシナリオ6でも保護エンドポイントの動作確認に使うため、任意ではなく実装する）。

## 実装上のポイント

- `@Valid` を付け忘れると`04_dto_auth`のBean Validationが効かない点に注意。
- レスポンスコードはサインアップ=`201 Created`、ログイン=`200 OK`と使い分ける。

## 受け入れ条件

- [ ] `POST /api/auth/signup` に正しいJSONを送るとユーザーが作成され、201とJWTが返る
- [ ] `POST /api/auth/login` に正しい認証情報を送ると200とJWTが返る
- [ ] `GET /api/auth/me` にトークン付きでアクセスすると200とユーザー情報が返る
- [ ] 不正なJSON（メール形式違反など）を送ると400とバリデーションエラーが返る（`08_exception_handling`の動作）

## 依存関係

`09_service_auth`
