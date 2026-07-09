package com.studentinfo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    private String tenthBoard;
    private String tenthSchool;
    private Double tenthPercentage;
    private Integer tenthYear;
    private String twelfthBoard;
    private String twelfthSchool;
    private Double twelfthPercentage;
    private Integer twelfthYear;
    private String diplomaInstitute;
    private Double diplomaPercentage;
    private Integer diplomaYear;
    private String ugInstitute;
    private String ugDegree;
    private String ugBranch;
    private Double ugCgpa;
    private Integer ugPassingYear;
    private Double currentSemesterCgpa;
    private Integer activeBacklogs;
    private Integer totalBacklogs;
    private Integer gapYears;
}
