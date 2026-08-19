# トラブルシューティング記録（Phase 1 認証・初回起動時）

`01`〜`11`の実装後、初めて`./mvnw spring-boot:run`した際に遭遇した3つのバグと修正内容の記録。同じ構成（Spring Boot 4.1.0）で再セットアップする場合の参考用。

---

## 1. `.env`の値が一切読み込まれない

- **症状**：`application.properties`の`${JWT_SECRET}`や`${DB_PASSWORD}`が解決できず起動時エラー（`Could not resolve placeholder`）
- **原因**：`pom.xml`に追加していた`me.paulschwarz:spring-dotenv`は自動登録の仕組み（`spring.factories`等）を持たないコア単体パッケージで、依存追加しただけでは有効化されない
- **修正**：Spring Boot 4専用の`me.paulschwarz:springboot4-dotenv`に差し替え（`optional=true`）。こちらは自動で`.env`をプロパティソースとして登録してくれる

## 2. `RestAuthenticationEntryPoint`のBean生成時に`NoClassDefFoundError: ObjectMapper`

- **症状**：起動時に`jwtAuthenticationFilter`/`securityConfig`のBean生成が失敗
- **原因**：Spring Boot 4（Spring Framework 7系）はJacksonのパッケージが`com.fasterxml.jackson.*`から**`tools.jackson.*`（Jackson 3系）**に移行している。旧パッケージの`com.fasterxml.jackson.databind.ObjectMapper`をimportしていたため、実行時にSpringが用意するBeanの型と一致せずクラス解決に失敗した（`jjwt-jackson`が旧Jacksonを道連れで持ち込んでいたため、コンパイルだけは通ってしまい発覚が遅れた）
- **修正**：`RestAuthenticationEntryPoint.java`のimportを`tools.jackson.databind.ObjectMapper`に変更

## 3. トークンなしで`/api/auth/me`にアクセスすると401ではなく500

- **症状**：`11_manual_verification.md`シナリオ6で、未認証アクセス時に期待した401ではなく500が返った
- **原因**：`SecurityConfig`の認可設定が`.requestMatchers("/api/auth/**").permitAll()`というワイルドカードになっており、本来認証必須の`/api/auth/me`まで未認証で通過してしまっていた。Controller内で未ログイン状態の`principal`を`UserPrincipal`として扱おうとして例外が発生し、`GlobalExceptionHandler`の汎用500ハンドラに落ちていた
- **修正**：`.requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()`に変更し、明示的に許可するパスだけを列挙する形にした（`07_security_config.md`の記載も合わせて修正済み）

---

## 4. （環境固有）`./mvnw test`で新しいプラグイン取得時に`certificate_unknown`エラー

- **症状**：`12_automated_tests`着手時、`maven-surefire-plugin`等の新規プラグイン/依存関係を取得しようとすると`PKIX path building failed`で失敗。ただしPowerShellの`Invoke-WebRequest`では同じURLに正常アクセスできた
- **原因**：**Avastアンチウイルスの「Web/Mail Shield」機能**がHTTPS通信を検査するため自己署名証明書に差し替えている。Windows自体はこの証明書を信頼しているが、JDKは独自の証明書ストア（cacerts）を持っており、そこにはAvastの証明書が入っていないため検証に失敗していた
- **修正**（このPC限定の対応。他の開発環境では不要）：
  1. Avastのルート証明書をWindowsの信頼チェーンから抽出
  2. JDKの`cacerts`のコピーを`~/.m2/maven-cacerts-with-avast`として作成し、そこにAvast証明書を`keytool -importcert`で追加（`Program Files`配下のJDK本体は書き込み権限がないため直接は変更していない）
  3. `backend/.mvn/jvm.config`（**gitignore対象**）でMavenにこの信頼ストアを使うよう指定
- 他の開発者・別PCでは、この対策（`.mvn/jvm.config`）は存在しない状態が正しい。もし同様のエラーが出た場合は、自分の環境のアンチウイルス/プロキシのTLS検査機能を疑うこと

## 教訓

- コンパイルが通ることと、実行時にクラス/Beanが解決できることは別問題（2番目のバグ）。特にメジャーバージョンが上がったフレームワークでは、意図せず新旧の同名クラスが混在しうる
- 認可設定のワイルドカードは「意図した範囲より広く許可していないか」を必ず実際にリクエストして確認する（`permitAll`の対象は最小限に）
