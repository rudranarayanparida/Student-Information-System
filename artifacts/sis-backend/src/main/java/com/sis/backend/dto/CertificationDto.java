package com.sis.backend.dto;

import com.sis.backend.entity.Certification;
import lombok.Data;

@Data
public class CertificationDto {
    private Long id;
    private String name;
    private String issuer;
    private String issueDate;
    private String expiryDate;
    private String credentialId;
    private String credentialUrl;

    public static CertificationDto from(Certification c) {
        CertificationDto dto = new CertificationDto();
        dto.id = c.getId();
        dto.name = c.getName();
        dto.issuer = c.getIssuer();
        dto.issueDate = c.getIssueDate() != null ? c.getIssueDate().toString() : null;
        dto.expiryDate = c.getExpiryDate() != null ? c.getExpiryDate().toString() : null;
        dto.credentialId = c.getCredentialId();
        dto.credentialUrl = c.getCredentialUrl();
        return dto;
    }
}
