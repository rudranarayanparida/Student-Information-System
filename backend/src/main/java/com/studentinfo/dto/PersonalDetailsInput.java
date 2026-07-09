package com.studentinfo.dto;

import lombok.Data;

@Data
public class PersonalDetailsInput {
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
