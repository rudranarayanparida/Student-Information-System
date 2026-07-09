package com.sis.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DriveInput {
    private String title;
    private String company;
    private String description;
    private List<String> eligibleDepartments;
    private BigDecimal minCgpa;
    private BigDecimal minTenthPercent;
    private BigDecimal minTwelfthPercent;
    private Integer maxBacklogs;
    private String driveDate;
    private String applicationDeadline;
    @JsonProperty("package")
    private String packageAmount;
    private String location;
    private String jobType;
    private String status;
}
