package com.sis.backend.dto;

import com.sis.backend.entity.PersonalDetails;
import lombok.Data;

@Data
public class PersonalDetailsDto {
    private Long studentId;
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

    public static PersonalDetailsDto from(PersonalDetails p) {
        if (p == null) return null;
        PersonalDetailsDto dto = new PersonalDetailsDto();
        dto.studentId = p.getStudentId();
        dto.dateOfBirth = p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : null;
        dto.gender = p.getGender();
        dto.phone = p.getPhone();
        dto.alternatePhone = p.getAlternatePhone();
        dto.permanentAddress = p.getPermanentAddress();
        dto.currentAddress = p.getCurrentAddress();
        dto.city = p.getCity();
        dto.state = p.getState();
        dto.pincode = p.getPincode();
        dto.nationality = p.getNationality();
        dto.category = p.getCategory();
        dto.aadharNumber = p.getAadharNumber();
        dto.panNumber = p.getPanNumber();
        dto.linkedinUrl = p.getLinkedinUrl();
        dto.githubUrl = p.getGithubUrl();
        dto.portfolioUrl = p.getPortfolioUrl();
        return dto;
    }
}
