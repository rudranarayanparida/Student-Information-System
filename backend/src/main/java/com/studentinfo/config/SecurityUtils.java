package com.studentinfo.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {}

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static Long getCurrentUserId() {
        Authentication auth = getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        return auth.getPrincipal() instanceof Long ? (Long) auth.getPrincipal() : null;
    }

    public static JwtAuthenticationDetails getCurrentDetails() {
        Authentication auth = getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return null;
        }
        return auth.getDetails() instanceof JwtAuthenticationDetails ? (JwtAuthenticationDetails) auth.getDetails() : null;
    }
}
