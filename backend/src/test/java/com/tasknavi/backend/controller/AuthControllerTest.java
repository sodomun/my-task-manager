package com.tasknavi.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * signup / login / me を実際にHTTP経由で叩く結合テスト。
 *
 * <p>DBは src/test/resources/application.properties で設定したメモリ上のH2を使うため、MySQLの起動は不要。
 * 各テストは @Transactional によりテスト後にロールバックされ、他のテストに影響しない。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("\"token\":\"([^\"]+)\"");

    @Autowired private MockMvc mockMvc;

    private String signupBody(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    @Test
    void signupSucceedsAndReturnsAToken() throws Exception {
        mockMvc.perform(
                        post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(signupBody("controller-test1@example.com", "password123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("controller-test1@example.com"))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void signupWithDuplicateEmailReturns409() throws Exception {
        String body = signupBody("controller-test2@example.com", "password123");

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void signupWithInvalidPayloadReturns400() throws Exception {
        mockMvc.perform(
                        post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(signupBody("not-an-email", "123")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginWithCorrectCredentialsReturns200() throws Exception {
        String body = signupBody("controller-test3@example.com", "password123");
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        mockMvc.perform(
                        post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(signupBody("controller-test4@example.com", "password123")))
                .andExpect(status().isCreated());

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(signupBody("controller-test4@example.com", "wrongpassword")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void meWithValidTokenReturns200() throws Exception {
        String body = signupBody("controller-test5@example.com", "password123");
        MvcResult signupResult =
                mockMvc.perform(
                                post("/api/auth/signup")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                        .andExpect(status().isCreated())
                        .andReturn();

        String token = extractToken(signupResult.getResponse().getContentAsString());

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("controller-test5@example.com"));
    }

    private String extractToken(String json) {
        Matcher matcher = TOKEN_PATTERN.matcher(json);
        if (!matcher.find()) {
            throw new IllegalStateException("token not found in response: " + json);
        }
        return matcher.group(1);
    }
}
