package com.studentinfo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "skills_details_id", nullable = false)
    private SkillsDetails skillsDetails;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String issuer;

    private String issueDate;
    private String expiryDate;
    private String credentialId;
    private String credentialUrl;
}
