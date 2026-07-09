package com.sis.backend.dto;

import com.sis.backend.entity.ExperienceEntry;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExperienceDto {
    private Long id;
    private Long studentId;
    private String type;
    private String title;
    private String company;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent;
    private String description;
    private BigDecimal stipend;
    private Boolean offerLetter;
    private Boolean completionCertificate;

    public static ExperienceDto from(ExperienceEntry e) {
        ExperienceDto dto = new ExperienceDto();
        dto.id = e.getId();
        dto.studentId = e.getStudentId();
        dto.type = e.getType();
        dto.title = e.getTitle();
        dto.company = e.getCompany();
        dto.location = e.getLocation();
        dto.startDate = e.getStartDate() != null ? e.getStartDate().toString() : null;
        dto.endDate = e.getEndDate() != null ? e.getEndDate().toString() : null;
        dto.isCurrent = e.getIsCurrent();
        dto.description = e.getDescription();
        dto.stipend = e.getStipend();
        dto.offerLetter = e.getOfferLetter();
        dto.completionCertificate = e.getCompletionCertificate();
        return dto;
    }
}
