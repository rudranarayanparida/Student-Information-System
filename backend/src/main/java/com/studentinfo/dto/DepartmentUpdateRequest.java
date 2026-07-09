package com.studentinfo.dto;

import lombok.Data;

@Data
public class DepartmentUpdateRequest {
    private String name;
    private String code;
    private String headName;
}
