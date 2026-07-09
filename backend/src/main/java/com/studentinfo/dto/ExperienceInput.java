package com.studentinfo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExperienceInput {
    @NotBlank
    private String type;

    @NotBlank
    private String title;

    @NotBlank
    private String company;

    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent = false;
    private String description;
    private Double stipend;
    private Boolean offerLetter = false;
    private Boolean completionCertificate = false;
}
