package com.tasknavi.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.tasknavi.backend.entity.User;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    // src/test/resources/application.properties の jwt.secret と同じ値。テスト専用の固定シークレット。
    private static final String SECRET =
            "dGVzdC1vbmx5LXNlY3JldC1rZXktZm9yLXVuaXQtdGVzdHMtZG8tbm90LXVzZS1pbi1wcm9k";

    private UserPrincipal testPrincipal() {
        User user = new User();
        user.setEmail("jwt-test@example.com");
        user.setPasswordHash("irrelevant-hash");
        return UserPrincipal.from(user);
    }

    @Test
    void generatesAndValidatesAValidToken() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 60_000);

        String token = provider.generateToken(testPrincipal());

        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getEmailFromToken(token)).isEqualTo("jwt-test@example.com");
    }

    @Test
    void rejectsAnExpiredToken() throws InterruptedException {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 1); // 1ミリ秒で期限切れにする
        String token = provider.generateToken(testPrincipal());

        Thread.sleep(20);

        assertThat(provider.validateToken(token)).isFalse();
    }

    @Test
    void rejectsATamperedToken() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 60_000);
        String token = provider.generateToken(testPrincipal());
        String tampered = token.substring(0, token.length() - 1) + (token.endsWith("a") ? "b" : "a");

        assertThat(provider.validateToken(tampered)).isFalse();
    }
}
