package com.studentinfo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CertificationInput {
    @NotBlank
    private String name;
    @NotBlank
    private String issuer;
    private String issueDate;
    private String expiryDate;
    private String credentialId;
    private String credentialUrl;
}
