package com.studentinfo.dto;

import lombok.Data;

import java.util.List;

@Data
public class SkillsDetailsInput {
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> languages;
    private List<String> tools;
    private List<CertificationInput> certifications;
}
