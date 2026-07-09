package com.sis.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class SkillsInput {
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> languages;
    private List<String> tools;
    private List<CertificationInput> certifications;

    @Data
    public static class CertificationInput {
        private String name;
        private String issuer;
        private String issueDate;
        private String expiryDate;
        private String credentialId;
        private String credentialUrl;
    }
}
