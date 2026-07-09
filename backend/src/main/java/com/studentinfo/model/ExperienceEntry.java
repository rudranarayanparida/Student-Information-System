package com.studentinfo.model;

import com.studentinfo.config.ExperienceType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "experience_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent = false;
    private String description;
    private Double stipend;
    private Boolean offerLetter = false;
    private Boolean completionCertificate = false;
}
