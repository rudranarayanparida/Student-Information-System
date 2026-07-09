package com.studentinfo.model;

import com.studentinfo.config.DriveStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String description;

    @ElementCollection
    @CollectionTable(name = "drive_eligible_departments", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "department_code")
    private List<String> eligibleDepartments = new ArrayList<>();

    private Double minCgpa;
    private Double minTenthPercent;
    private Double minTwelfthPercent;
    private Integer maxBacklogs;
    private String driveDate;
    private String applicationDeadline;
    private String packageInfo;
    private String location;
    private String jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriveStatus status = DriveStatus.UPCOMING;

    private Integer applicantCount = 0;
    private Integer selectedCount = 0;
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
