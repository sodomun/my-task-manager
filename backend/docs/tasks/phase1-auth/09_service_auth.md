# 09. `AuthService`

## 目的

サインアップ・ログインのビジネスロジックを実装する。

## 作成ファイル

`src/main/java/com/tasknavi/backend/service/AuthService.java`

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("このメールアドレスは既に登録されています");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(UserPrincipal.from(user));
        return new AuthResponse(token, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        ); // 認証失敗時はBadCredentialsExceptionが自動的にスローされる

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);
        return new AuthResponse(token, principal.getUsername());
    }
}
```

## 実装上のポイント（元の案からの補足）

- 全依存を**コンストラクタインジェクション＋`@RequiredArgsConstructor`**で受け取る（`final`フィールド）。フィールド`@Autowired`は使わない。
- `login`では自前でパスワード比較をせず、`AuthenticationManager.authenticate(...)`にすべて委譲する（`06_security_core`で登録した`CustomUserDetailsService`＋`PasswordEncoder`が内部で使われる）。これによりロジックの重複を避ける。
- `signup`は`@Transactional`を付け、途中失敗時にユーザーが中途半端に保存されないようにする。

## 受け入れ条件

- [ ] 同じメールアドレスで2回サインアップすると`EmailAlreadyExistsException`が発生する
- [ ] サインアップ直後、DBの`password_hash`カラムが平文ではなくBCryptハッシュ（`$2a$...`形式）になっている
- [ ] 正しいメール・パスワードでログインするとJWTが返る
- [ ] 誤ったパスワードでログインすると`BadCredentialsException`が発生する

## 依存関係

`05_repository_user`, `06_security_core`, `08_exception_handling`
