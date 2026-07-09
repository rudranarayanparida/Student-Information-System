package com.sis.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    private Integer year;
    private String section;

    @Column(name = "placement_status")
    private String placementStatus = "NOT_PLACED";

    @Column(name = "profile_completion_percent")
    private Integer profileCompletionPercent = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
