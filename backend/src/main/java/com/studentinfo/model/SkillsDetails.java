package com.studentinfo.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skills_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillsDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @ElementCollection
    @CollectionTable(name = "student_technical_skills", joinColumns = @JoinColumn(name = "skills_details_id"))
    @Column(name = "skill")
    private List<String> technicalSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "student_soft_skills", joinColumns = @JoinColumn(name = "skills_details_id"))
    @Column(name = "skill")
    private List<String> softSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "student_languages", joinColumns = @JoinColumn(name = "skills_details_id"))
    @Column(name = "language")
    private List<String> languages = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "student_tools", joinColumns = @JoinColumn(name = "skills_details_id"))
    @Column(name = "tool")
    private List<String> tools = new ArrayList<>();

    @OneToMany(mappedBy = "skillsDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Certification> certifications = new ArrayList<>();
}
