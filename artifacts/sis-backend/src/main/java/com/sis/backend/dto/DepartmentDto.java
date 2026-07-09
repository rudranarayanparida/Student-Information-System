package com.sis.backend.dto;

import com.sis.backend.entity.Department;
import lombok.Data;

@Data
public class DepartmentDto {
    private Long id;
    private String name;
    private String code;
    private String headName;
    private int studentCount;
    private int placedCount;

    public static DepartmentDto from(Department d, int studentCount, int placedCount) {
        DepartmentDto dto = new DepartmentDto();
        dto.id = d.getId();
        dto.name = d.getName();
        dto.code = d.getCode();
        dto.headName = d.getHeadName();
        dto.studentCount = studentCount;
        dto.placedCount = placedCount;
        return dto;
    }
}
