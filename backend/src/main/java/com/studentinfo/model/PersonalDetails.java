package com.studentinfo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personal_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    private String dateOfBirth;
    private String gender;
    private String phone;
    private String alternatePhone;
    private String permanentAddress;
    private String currentAddress;
    private String city;
    private String state;
    private String pincode;
    private String nationality;
    private String category;
    private String aadharNumber;
    private String panNumber;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
