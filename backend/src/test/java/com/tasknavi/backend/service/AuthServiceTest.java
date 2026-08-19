package com.tasknavi.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tasknavi.backend.dto.request.LoginRequest;
import com.tasknavi.backend.dto.request.SignupRequest;
import com.tasknavi.backend.dto.response.AuthResponse;
import com.tasknavi.backend.entity.User;
import com.tasknavi.backend.exception.EmailAlreadyExistsException;
import com.tasknavi.backend.repository.UserRepository;
import com.tasknavi.backend.security.JwtTokenProvider;
import com.tasknavi.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService =
                new AuthService(userRepository, passwordEncoder, authenticationManager, jwtTokenProvider);
    }

    @Test
    void signupSavesANewUserAndReturnsAToken() {
        SignupRequest request = new SignupRequest("new@example.com", "password123");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(jwtTokenProvider.generateToken(any(UserPrincipal.class))).thenReturn("dummy-token");

        AuthResponse response = authService.signup(request);

        assertThat(response.token()).isEqualTo("dummy-token");
        assertThat(response.email()).isEqualTo("new@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signupRejectsADuplicateEmail() {
        SignupRequest request = new SignupRequest("dup@example.com", "password123");
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginDelegatesToAuthenticationManagerAndReturnsAToken() {
        LoginRequest request = new LoginRequest("login@example.com", "password123");
        User user = new User();
        user.setEmail("login@example.com");
        user.setPasswordHash("hashed");
        UserPrincipal principal = UserPrincipal.from(user);
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(principal)).thenReturn("login-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("login-token");
        assertThat(response.email()).isEqualTo("login@example.com");
    }
}
