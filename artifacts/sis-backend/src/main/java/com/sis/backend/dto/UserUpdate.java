package com.sis.backend.dto;

import lombok.Data;

@Data
public class UserUpdate {
    private String email;
    private String fullName;
    private String role;
    private Long departmentId;
    private String password;
}
