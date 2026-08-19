package com.tasknavi.backend.service;

import com.tasknavi.backend.dto.request.LoginRequest;
import com.tasknavi.backend.dto.request.SignupRequest;
import com.tasknavi.backend.dto.response.AuthResponse;
import com.tasknavi.backend.entity.User;
import com.tasknavi.backend.exception.EmailAlreadyExistsException;
import com.tasknavi.backend.repository.UserRepository;
import com.tasknavi.backend.security.JwtTokenProvider;
import com.tasknavi.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // 認証失敗時(メール不一致・パスワード不一致)はBadCredentialsExceptionが自動的にスローされる
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);
        return new AuthResponse(token, principal.getUsername());
    }
}
