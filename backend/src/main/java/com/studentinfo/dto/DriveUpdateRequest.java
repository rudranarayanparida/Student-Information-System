package com.studentinfo.dto;

import lombok.Data;

import java.util.List;

@Data
public class DriveUpdateRequest {
    private String title;
    private String company;
    private String description;
    private List<String> eligibleDepartments;
    private Double minCgpa;
    private Double minTenthPercent;
    private Double minTwelfthPercent;
    private Integer maxBacklogs;
    private String driveDate;
    private String applicationDeadline;
    private String packageInfo;
    private String location;
    private String jobType;
    private String status;
}
