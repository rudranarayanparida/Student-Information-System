package com.sis.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "personal_details")
@Data
@NoArgsConstructor
public class PersonalDetails {
    @Id
    @Column(name = "student_id")
    private Long studentId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;
    private String phone;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    @Column(name = "permanent_address")
    private String permanentAddress;

    @Column(name = "current_address")
    private String currentAddress;

    private String city;
    private String state;
    private String pincode;
    private String nationality;
    private String category;

    @Column(name = "aadhar_number")
    private String aadharNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;
}
