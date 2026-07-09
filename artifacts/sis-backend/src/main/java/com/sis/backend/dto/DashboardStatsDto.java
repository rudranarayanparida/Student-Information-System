package com.sis.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalStudents;
    private long placedStudents;
    private long activeDrives;
    private long departmentsCount;
    private double placementPercentage;
    private String avgPackage;
    private double profileCompletionAvg;
    private long totalUsers;
}
