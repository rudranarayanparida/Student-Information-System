package com.studentinfo.dto;

import lombok.Data;

@Data
public class AcademicDetailsInput {
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
