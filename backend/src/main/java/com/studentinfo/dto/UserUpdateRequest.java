package com.studentinfo.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Email
    private String email;
    private String fullName;
    private String role;
    private Long departmentId;
    private String password;
}
