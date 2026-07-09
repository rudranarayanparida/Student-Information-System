package com.sis.backend.dto;

import lombok.Data;

@Data
public class UserInput {
    private String email;
    private String password;
    private String role;
    private String fullName;
    private Long departmentId;
    // For STUDENT role: auto-creates a student record
    private String rollNumber;
    private Integer year;
}
