package com.sis.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DepartmentPlacementSummaryDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private long totalStudents;
    private long placedStudents;
    private double placementPercentage;
}
