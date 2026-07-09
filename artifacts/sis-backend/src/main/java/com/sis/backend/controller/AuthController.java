package com.sis.backend.controller;

import com.sis.backend.dto.AuthResponse;
import com.sis.backend.dto.LoginRequest;
import com.sis.backend.dto.UserDto;
import com.sis.backend.security.SisUserDetails;
import com.sis.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Logged out successfully");
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal SisUserDetails principal) {
        return authService.getCurrentUser(principal);
    }
}
