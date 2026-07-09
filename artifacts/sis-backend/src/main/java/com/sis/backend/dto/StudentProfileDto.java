package com.sis.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class StudentProfileDto {
    private StudentDto student;
    private PersonalDetailsDto personal;
    private AcademicDetailsDto academic;
    private List<ExperienceDto> experience;
    private SkillsDto skills;
    private List<AchievementDto> achievements;
}
