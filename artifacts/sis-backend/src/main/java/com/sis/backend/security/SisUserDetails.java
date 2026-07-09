package com.sis.backend.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SisUserDetails {
    private final Long userId;
    private final String role;
    private final Long studentId;
    private final Long departmentId;
}
