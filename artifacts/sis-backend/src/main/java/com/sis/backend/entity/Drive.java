package com.sis.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "drives")
@Data
@NoArgsConstructor
public class Drive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "eligible_departments", columnDefinition = "text[]")
    private String[] eligibleDepartments;

    @Column(name = "min_cgpa")
    private BigDecimal minCgpa;

    @Column(name = "min_tenth_percent")
    private BigDecimal minTenthPercent;

    @Column(name = "min_twelfth_percent")
    private BigDecimal minTwelfthPercent;

    @Column(name = "max_backlogs")
    private Integer maxBacklogs;

    @Column(name = "drive_date")
    private LocalDate driveDate;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "package")
    private String packageAmount;

    private String location;

    @Column(name = "job_type")
    private String jobType;

    private String status = "UPCOMING";

    @Column(name = "applicant_count")
    private Integer applicantCount = 0;

    @Column(name = "selected_count")
    private Integer selectedCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
