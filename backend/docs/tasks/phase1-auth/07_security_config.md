# 07. `SecurityConfig`（フィルタチェーン・CORS・401応答）

## 目的

Spring Security全体の設定を1箇所にまとめ、JWTフィルタを組み込む。

## 作成ファイル

```text
src/main/java/com/tasknavi/backend/config/SecurityConfig.java
```

（`RestAuthenticationEntryPoint` は `08_exception_handling` で作成し、ここから参照する）

## 設計

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex ->
                ex.authenticationEntryPoint(restAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

`application.properties`側:

```properties
app.cors.allowed-origins=http://localhost:5173
```

- 許可オリジンをコード直書きではなく設定値にすることで、本番環境（別ドメイン）でも`application.properties`（または環境変数）の変更だけで対応できるようにする。

## 実装上のポイント（元の案からの補足）

- `csrf().disable()` はJWTによるステートレスAPIでは一般的（Cookieセッションを使わないためCSRFの前提が成立しない）。
- CORSの許可オリジンはフロントエンドの開発サーバーのポートに合わせて調整する（Vite=5173, CRA=3000など）。
- `/api/auth/**` のみ未認証アクセスを許可し、それ以外（今後実装するタスクAPI等）はデフォルトで認証必須にしておく。

## 受け入れ条件

- [ ] トークンなしで保護対象エンドポイントにアクセスすると401が返る（デフォルトのログインフォームHTMLではなくJSON）
- [ ] `/api/auth/signup` `/api/auth/login` は未認証でアクセスできる
- [ ] フロントの開発サーバーからのCORSリクエストが通る

## 依存関係

`06_security_core`, `08_exception_handling`（`RestAuthenticationEntryPoint`）
