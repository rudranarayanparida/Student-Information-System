package com.sis.backend.dto;

import com.sis.backend.entity.Student;
import lombok.Data;

@Data
public class StudentDto {
    private Long id;
    private String rollNumber;
    private Long userId;
    private String fullName;
    private String email;
    private Long departmentId;
    private String departmentName;
    private Integer year;
    private String section;
    private String placementStatus;
    private Integer profileCompletionPercent;

    public static StudentDto from(Student s) {
        StudentDto dto = new StudentDto();
        dto.id = s.getId();
        dto.rollNumber = s.getRollNumber();
        dto.userId = s.getUserId();
        dto.fullName = s.getUser() != null ? s.getUser().getFullName() : null;
        dto.email = s.getUser() != null ? s.getUser().getEmail() : null;
        dto.departmentId = s.getDepartmentId();
        dto.departmentName = s.getDepartment() != null ? s.getDepartment().getName() : null;
        dto.year = s.getYear();
        dto.section = s.getSection();
        dto.placementStatus = s.getPlacementStatus();
        dto.profileCompletionPercent = s.getProfileCompletionPercent();
        return dto;
    }
}
