package com.sis.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "academic_details")
@Data
@NoArgsConstructor
public class AcademicDetails {
    @Id
    @Column(name = "student_id")
    private Long studentId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "tenth_board")   private String tenthBoard;
    @Column(name = "tenth_school")  private String tenthSchool;
    @Column(name = "tenth_percentage") private BigDecimal tenthPercentage;
    @Column(name = "tenth_year")    private Integer tenthYear;

    @Column(name = "twelfth_board")      private String twelfthBoard;
    @Column(name = "twelfth_school")     private String twelfthSchool;
    @Column(name = "twelfth_percentage") private BigDecimal twelfthPercentage;
    @Column(name = "twelfth_year")       private Integer twelfthYear;

    @Column(name = "diploma_institute")  private String diplomaInstitute;
    @Column(name = "diploma_percentage") private BigDecimal diplomaPercentage;
    @Column(name = "diploma_year")       private Integer diplomaYear;

    @Column(name = "ug_institute")    private String ugInstitute;
    @Column(name = "ug_degree")       private String ugDegree;
    @Column(name = "ug_branch")       private String ugBranch;
    @Column(name = "ug_cgpa")         private BigDecimal ugCgpa;
    @Column(name = "ug_passing_year") private Integer ugPassingYear;

    @Column(name = "current_semester_cgpa") private BigDecimal currentSemesterCgpa;
    @Column(name = "active_backlogs")  private Integer activeBacklogs = 0;
    @Column(name = "total_backlogs")   private Integer totalBacklogs = 0;
    @Column(name = "gap_years")        private Integer gapYears = 0;
}
