package com.sis.backend.dto;

import com.sis.backend.entity.AcademicDetails;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AcademicDetailsDto {
    private Long studentId;
    private String tenthBoard, tenthSchool;
    private BigDecimal tenthPercentage;
    private Integer tenthYear;
    private String twelfthBoard, twelfthSchool;
    private BigDecimal twelfthPercentage;
    private Integer twelfthYear;
    private String diplomaInstitute;
    private BigDecimal diplomaPercentage;
    private Integer diplomaYear;
    private String ugInstitute, ugDegree, ugBranch;
    private BigDecimal ugCgpa;
    private Integer ugPassingYear;
    private BigDecimal currentSemesterCgpa;
    private Integer activeBacklogs, totalBacklogs, gapYears;

    public static AcademicDetailsDto from(AcademicDetails a) {
        if (a == null) return null;
        AcademicDetailsDto dto = new AcademicDetailsDto();
        dto.studentId = a.getStudentId();
        dto.tenthBoard = a.getTenthBoard();
        dto.tenthSchool = a.getTenthSchool();
        dto.tenthPercentage = a.getTenthPercentage();
        dto.tenthYear = a.getTenthYear();
        dto.twelfthBoard = a.getTwelfthBoard();
        dto.twelfthSchool = a.getTwelfthSchool();
        dto.twelfthPercentage = a.getTwelfthPercentage();
        dto.twelfthYear = a.getTwelfthYear();
        dto.diplomaInstitute = a.getDiplomaInstitute();
        dto.diplomaPercentage = a.getDiplomaPercentage();
        dto.diplomaYear = a.getDiplomaYear();
        dto.ugInstitute = a.getUgInstitute();
        dto.ugDegree = a.getUgDegree();
        dto.ugBranch = a.getUgBranch();
        dto.ugCgpa = a.getUgCgpa();
        dto.ugPassingYear = a.getUgPassingYear();
        dto.currentSemesterCgpa = a.getCurrentSemesterCgpa();
        dto.activeBacklogs = a.getActiveBacklogs();
        dto.totalBacklogs = a.getTotalBacklogs();
        dto.gapYears = a.getGapYears();
        return dto;
    }
}
