package com.sis.backend.dto;

import com.sis.backend.entity.Achievement;
import lombok.Data;

@Data
public class AchievementDto {
    private Long id;
    private Long studentId;
    private String title;
    private String description;
    private String date;
    private String category;
    private String proof;

    public static AchievementDto from(Achievement a) {
        AchievementDto dto = new AchievementDto();
        dto.id = a.getId();
        dto.studentId = a.getStudentId();
        dto.title = a.getTitle();
        dto.description = a.getDescription();
        dto.date = a.getDate() != null ? a.getDate().toString() : null;
        dto.category = a.getCategory();
        dto.proof = a.getProof();
        return dto;
    }
}
