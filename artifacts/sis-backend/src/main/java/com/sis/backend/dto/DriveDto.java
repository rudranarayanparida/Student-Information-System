package com.sis.backend.dto;

import com.sis.backend.entity.Drive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
public class DriveDto {
    private Long id;
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
    private String packageAmount;
    private String location;
    private String jobType;
    private String status;
    private int applicantCount;
    private int selectedCount;
    private String createdAt;

    // Jackson needs "package" field name to match OpenAPI
    public String getPackage() { return packageAmount; }
    public void setPackage(String v) { this.packageAmount = v; }

    public static DriveDto from(Drive d) {
        DriveDto dto = new DriveDto();
        dto.id = d.getId();
        dto.title = d.getTitle();
        dto.company = d.getCompany();
        dto.description = d.getDescription();
        dto.eligibleDepartments = d.getEligibleDepartments() != null
                ? Arrays.asList(d.getEligibleDepartments()) : Collections.emptyList();
        dto.minCgpa = d.getMinCgpa();
        dto.minTenthPercent = d.getMinTenthPercent();
        dto.minTwelfthPercent = d.getMinTwelfthPercent();
        dto.maxBacklogs = d.getMaxBacklogs();
        dto.driveDate = d.getDriveDate() != null ? d.getDriveDate().toString() : null;
        dto.applicationDeadline = d.getApplicationDeadline() != null ? d.getApplicationDeadline().toString() : null;
        dto.packageAmount = d.getPackageAmount();
        dto.location = d.getLocation();
        dto.jobType = d.getJobType();
        dto.status = d.getStatus();
        dto.applicantCount = d.getApplicantCount() != null ? d.getApplicantCount() : 0;
        dto.selectedCount = d.getSelectedCount() != null ? d.getSelectedCount() : 0;
        dto.createdAt = d.getCreatedAt() != null ? d.getCreatedAt().toString() : null;
        return dto;
    }
}
