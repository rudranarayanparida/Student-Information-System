package com.studentinfo.dto;

import lombok.Data;

@Data
public class ExperienceUpdateRequest {
    private String type;
    private String title;
    private String company;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent;
    private String description;
    private Double stipend;
    private Boolean offerLetter;
    private Boolean completionCertificate;
}
