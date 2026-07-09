package com.sis.backend.dto;

import com.sis.backend.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private Long departmentId;
    private String departmentName;
    private Long studentId;
    private LocalDateTime createdAt;

    public static UserDto from(User u, Long studentId) {
        UserDto dto = new UserDto();
        dto.id = u.getId();
        dto.email = u.getEmail();
        dto.role = u.getRole();
        dto.fullName = u.getFullName();
        dto.departmentId = u.getDepartmentId();
        dto.departmentName = u.getDepartment() != null ? u.getDepartment().getName() : null;
        dto.studentId = studentId;
        dto.createdAt = u.getCreatedAt();
        return dto;
    }
}
