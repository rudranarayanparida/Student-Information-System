package com.studentinfo.config;

public class JwtAuthenticationDetails {
    private final Role role;
    private final Long departmentId;
    private final Long studentId;

    public JwtAuthenticationDetails(Role role, Long departmentId, Long studentId) {
        this.role = role;
        this.departmentId = departmentId;
        this.studentId = studentId;
    }

    public Role getRole() {
        return role;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public Long getStudentId() {
        return studentId;
    }
}
