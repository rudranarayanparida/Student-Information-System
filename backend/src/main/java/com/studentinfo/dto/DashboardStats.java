package com.studentinfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalStudents;
    private long placedStudents;
    private long activeDrives;
    private long departmentsCount;
    private double placementPercentage;
    private String avgPackage;
    private double profileCompletionAvg;
    private long totalUsers;
}
