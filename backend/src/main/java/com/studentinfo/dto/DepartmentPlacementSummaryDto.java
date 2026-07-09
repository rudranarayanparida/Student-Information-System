package com.studentinfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentPlacementSummaryDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private long totalStudents;
    private long placedStudents;
    private double placementPercentage;
}
