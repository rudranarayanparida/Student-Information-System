package com.sis.backend.dto;

import com.sis.backend.entity.SkillsDetails;
import lombok.Data;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
public class SkillsDto {
    private Long studentId;
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> languages;
    private List<String> tools;
    private List<CertificationDto> certifications;

    public static SkillsDto from(SkillsDetails s, List<CertificationDto> certifications) {
        SkillsDto dto = new SkillsDto();
        dto.studentId = s.getStudentId();
        dto.technicalSkills = s.getTechnicalSkills() != null ? Arrays.asList(s.getTechnicalSkills()) : Collections.emptyList();
        dto.softSkills = s.getSoftSkills() != null ? Arrays.asList(s.getSoftSkills()) : Collections.emptyList();
        dto.languages = s.getLanguages() != null ? Arrays.asList(s.getLanguages()) : Collections.emptyList();
        dto.tools = s.getTools() != null ? Arrays.asList(s.getTools()) : Collections.emptyList();
        dto.certifications = certifications != null ? certifications : Collections.emptyList();
        return dto;
    }
}
