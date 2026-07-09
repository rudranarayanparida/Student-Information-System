package com.studentinfo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AchievementInput {
    @NotBlank
    private String title;
    private String description;
    private String date;
    private String category;
    private String proof;
}
