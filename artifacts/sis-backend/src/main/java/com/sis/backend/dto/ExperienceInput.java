package com.sis.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExperienceInput {
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
}
