package com.sis.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "skills_details")
@Data
@NoArgsConstructor
public class SkillsDetails {
    @Id
    @Column(name = "student_id")
    private Long studentId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "technical_skills", columnDefinition = "text[]")
    private String[] technicalSkills;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "soft_skills", columnDefinition = "text[]")
    private String[] softSkills;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "languages", columnDefinition = "text[]")
    private String[] languages;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tools", columnDefinition = "text[]")
    private String[] tools;
}
