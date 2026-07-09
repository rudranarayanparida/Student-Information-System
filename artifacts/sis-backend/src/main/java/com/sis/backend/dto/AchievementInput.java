package com.sis.backend.dto;

import lombok.Data;

@Data
public class AchievementInput {
    private String title;
    private String description;
    private String date;
    private String category;
    private String proof;
}
