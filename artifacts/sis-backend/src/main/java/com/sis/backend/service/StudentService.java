package com.sis.backend.service;

import com.sis.backend.dto.*;
import com.sis.backend.entity.*;
import com.sis.backend.exception.NotFoundException;
import com.sis.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final PersonalDetailsRepository personalDetailsRepository;
    private final AcademicDetailsRepository academicDetailsRepository;
    private final ExperienceEntryRepository experienceEntryRepository;
    private final SkillsDetailsRepository skillsDetailsRepository;
    private final CertificationRepository certificationRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityLogRepository activityLogRepository;

    public StudentListResponse listStudents(Long departmentId, String search, Integer year,
                                            String placementStatus, int page, int pageSize) {
        String status = (placementStatus == null || placementStatus.isBlank()) ? null : placementStatus;
        String srch = (search == null || search.isBlank()) ? null : search;
        Page<Student> result = studentRepository.findWithFilters(
                departmentId, year, status, srch, PageRequest.of(page - 1, pageSize));
        return new StudentListResponse(
                result.getContent().stream().map(StudentDto::from).toList(),
                result.getTotalElements(), page, pageSize);
    }

    public StudentProfileDto getStudent(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        PersonalDetails personal = personalDetailsRepository.findById(studentId).orElse(null);
        AcademicDetails academic = academicDetailsRepository.findById(studentId).orElse(null);
        List<ExperienceEntry> experiences = experienceEntryRepository.findByStudentIdOrderByStartDateDesc(studentId);
        SkillsDetails skills = skillsDetailsRepository.findById(studentId).orElse(null);
        List<Certification> certs = certificationRepository.findByStudentId(studentId);
        List<Achievement> achievements = achievementRepository.findByStudentIdOrderByDateDesc(studentId);

        SkillsDto skillsDto = skills != null
                ? SkillsDto.from(skills, certs.stream().map(CertificationDto::from).toList())
                : null;

        return new StudentProfileDto(
                StudentDto.from(s),
                PersonalDetailsDto.from(personal),
                AcademicDetailsDto.from(academic),
                experiences.stream().map(ExperienceDto::from).toList(),
                skillsDto,
                achievements.stream().map(AchievementDto::from).toList()
        );
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId))
            throw new NotFoundException("Student not found");
        studentRepository.deleteById(studentId);
    }

    // Personal Details
    public PersonalDetailsDto getPersonalDetails(Long studentId) {
        return PersonalDetailsDto.from(personalDetailsRepository.findById(studentId).orElse(null));
    }

    @Transactional
    public PersonalDetailsDto upsertPersonalDetails(Long studentId, PersonalDetailsDto input) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        PersonalDetails p = personalDetailsRepository.findById(studentId)
                .orElseGet(() -> { PersonalDetails n = new PersonalDetails(); n.setStudent(student); return n; });
        applyPersonalInput(p, input);
        p = personalDetailsRepository.save(p);
        updateProfileCompletion(studentId);
        return PersonalDetailsDto.from(p);
    }

    private void applyPersonalInput(PersonalDetails p, PersonalDetailsDto i) {
        if (i.getDateOfBirth() != null && !i.getDateOfBirth().isBlank())
            p.setDateOfBirth(LocalDate.parse(i.getDateOfBirth()));
        if (i.getGender() != null) p.setGender(i.getGender());
        if (i.getPhone() != null) p.setPhone(i.getPhone());
        if (i.getAlternatePhone() != null) p.setAlternatePhone(i.getAlternatePhone());
        if (i.getPermanentAddress() != null) p.setPermanentAddress(i.getPermanentAddress());
        if (i.getCurrentAddress() != null) p.setCurrentAddress(i.getCurrentAddress());
        if (i.getCity() != null) p.setCity(i.getCity());
        if (i.getState() != null) p.setState(i.getState());
        if (i.getPincode() != null) p.setPincode(i.getPincode());
        if (i.getNationality() != null) p.setNationality(i.getNationality());
        if (i.getCategory() != null) p.setCategory(i.getCategory());
        if (i.getAadharNumber() != null) p.setAadharNumber(i.getAadharNumber());
        if (i.getPanNumber() != null) p.setPanNumber(i.getPanNumber());
        if (i.getLinkedinUrl() != null) p.setLinkedinUrl(i.getLinkedinUrl());
        if (i.getGithubUrl() != null) p.setGithubUrl(i.getGithubUrl());
        if (i.getPortfolioUrl() != null) p.setPortfolioUrl(i.getPortfolioUrl());
    }

    // Academic Details
    public AcademicDetailsDto getAcademicDetails(Long studentId) {
        return AcademicDetailsDto.from(academicDetailsRepository.findById(studentId).orElse(null));
    }

    @Transactional
    public AcademicDetailsDto upsertAcademicDetails(Long studentId, AcademicDetailsDto input) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        AcademicDetails a = academicDetailsRepository.findById(studentId)
                .orElseGet(() -> { AcademicDetails n = new AcademicDetails(); n.setStudent(student); return n; });
        if (input.getTenthBoard() != null) a.setTenthBoard(input.getTenthBoard());
        if (input.getTenthSchool() != null) a.setTenthSchool(input.getTenthSchool());
        if (input.getTenthPercentage() != null) a.setTenthPercentage(input.getTenthPercentage());
        if (input.getTenthYear() != null) a.setTenthYear(input.getTenthYear());
        if (input.getTwelfthBoard() != null) a.setTwelfthBoard(input.getTwelfthBoard());
        if (input.getTwelfthSchool() != null) a.setTwelfthSchool(input.getTwelfthSchool());
        if (input.getTwelfthPercentage() != null) a.setTwelfthPercentage(input.getTwelfthPercentage());
        if (input.getTwelfthYear() != null) a.setTwelfthYear(input.getTwelfthYear());
        if (input.getDiplomaInstitute() != null) a.setDiplomaInstitute(input.getDiplomaInstitute());
        if (input.getDiplomaPercentage() != null) a.setDiplomaPercentage(input.getDiplomaPercentage());
        if (input.getDiplomaYear() != null) a.setDiplomaYear(input.getDiplomaYear());
        if (input.getUgInstitute() != null) a.setUgInstitute(input.getUgInstitute());
        if (input.getUgDegree() != null) a.setUgDegree(input.getUgDegree());
        if (input.getUgBranch() != null) a.setUgBranch(input.getUgBranch());
        if (input.getUgCgpa() != null) a.setUgCgpa(input.getUgCgpa());
        if (input.getUgPassingYear() != null) a.setUgPassingYear(input.getUgPassingYear());
        if (input.getCurrentSemesterCgpa() != null) a.setCurrentSemesterCgpa(input.getCurrentSemesterCgpa());
        if (input.getActiveBacklogs() != null) a.setActiveBacklogs(input.getActiveBacklogs());
        if (input.getTotalBacklogs() != null) a.setTotalBacklogs(input.getTotalBacklogs());
        if (input.getGapYears() != null) a.setGapYears(input.getGapYears());
        a = academicDetailsRepository.save(a);
        updateProfileCompletion(studentId);
        return AcademicDetailsDto.from(a);
    }

    // Experience
    public List<ExperienceDto> listExperience(Long studentId) {
        return experienceEntryRepository.findByStudentIdOrderByStartDateDesc(studentId)
                .stream().map(ExperienceDto::from).toList();
    }

    @Transactional
    public ExperienceDto addExperience(Long studentId, ExperienceInput input) {
        if (!studentRepository.existsById(studentId)) throw new NotFoundException("Student not found");
        ExperienceEntry e = new ExperienceEntry();
        e.setStudentId(studentId);
        applyExperienceInput(e, input);
        e = experienceEntryRepository.save(e);
        log("EXPERIENCE_ADDED", studentId + " added experience: " + e.getTitle(), e.getCompany());
        return ExperienceDto.from(e);
    }

    @Transactional
    public ExperienceDto updateExperience(Long studentId, Long experienceId, ExperienceInput input) {
        ExperienceEntry e = experienceEntryRepository.findById(experienceId)
                .orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!e.getStudentId().equals(studentId)) throw new NotFoundException("Experience not found");
        applyExperienceInput(e, input);
        return ExperienceDto.from(experienceEntryRepository.save(e));
    }

    @Transactional
    public void deleteExperience(Long studentId, Long experienceId) {
        ExperienceEntry e = experienceEntryRepository.findById(experienceId)
                .orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!e.getStudentId().equals(studentId)) throw new NotFoundException("Experience not found");
        experienceEntryRepository.delete(e);
    }

    private void applyExperienceInput(ExperienceEntry e, ExperienceInput i) {
        if (i.getType() != null) e.setType(i.getType());
        if (i.getTitle() != null) e.setTitle(i.getTitle());
        if (i.getCompany() != null) e.setCompany(i.getCompany());
        if (i.getLocation() != null) e.setLocation(i.getLocation());
        if (i.getStartDate() != null && !i.getStartDate().isBlank()) e.setStartDate(LocalDate.parse(i.getStartDate()));
        if (i.getEndDate() != null && !i.getEndDate().isBlank()) e.setEndDate(LocalDate.parse(i.getEndDate()));
        if (i.getIsCurrent() != null) e.setIsCurrent(i.getIsCurrent());
        if (i.getDescription() != null) e.setDescription(i.getDescription());
        if (i.getStipend() != null) e.setStipend(i.getStipend());
        if (i.getOfferLetter() != null) e.setOfferLetter(i.getOfferLetter());
        if (i.getCompletionCertificate() != null) e.setCompletionCertificate(i.getCompletionCertificate());
    }

    // Skills
    public SkillsDto getSkillsDetails(Long studentId) {
        SkillsDetails s = skillsDetailsRepository.findById(studentId).orElse(null);
        List<Certification> certs = certificationRepository.findByStudentId(studentId);
        if (s == null) {
            SkillsDto empty = new SkillsDto();
            empty.setStudentId(studentId);
            empty.setTechnicalSkills(Collections.emptyList());
            empty.setSoftSkills(Collections.emptyList());
            empty.setLanguages(Collections.emptyList());
            empty.setTools(Collections.emptyList());
            empty.setCertifications(certs.stream().map(CertificationDto::from).toList());
            return empty;
        }
        return SkillsDto.from(s, certs.stream().map(CertificationDto::from).toList());
    }

    @Transactional
    public SkillsDto upsertSkillsDetails(Long studentId, SkillsInput input) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        SkillsDetails s = skillsDetailsRepository.findById(studentId)
                .orElseGet(() -> { SkillsDetails n = new SkillsDetails(); n.setStudent(student); return n; });
        if (input.getTechnicalSkills() != null) s.setTechnicalSkills(input.getTechnicalSkills().toArray(new String[0]));
        if (input.getSoftSkills() != null) s.setSoftSkills(input.getSoftSkills().toArray(new String[0]));
        if (input.getLanguages() != null) s.setLanguages(input.getLanguages().toArray(new String[0]));
        if (input.getTools() != null) s.setTools(input.getTools().toArray(new String[0]));
        s = skillsDetailsRepository.save(s);

        // Replace certifications
        if (input.getCertifications() != null) {
            certificationRepository.deleteByStudentId(studentId);
            List<Certification> saved = input.getCertifications().stream().map(ci -> {
                Certification c = new Certification();
                c.setStudentId(studentId);
                c.setName(ci.getName());
                c.setIssuer(ci.getIssuer());
                if (ci.getIssueDate() != null && !ci.getIssueDate().isBlank()) c.setIssueDate(LocalDate.parse(ci.getIssueDate()));
                if (ci.getExpiryDate() != null && !ci.getExpiryDate().isBlank()) c.setExpiryDate(LocalDate.parse(ci.getExpiryDate()));
                c.setCredentialId(ci.getCredentialId());
                c.setCredentialUrl(ci.getCredentialUrl());
                return certificationRepository.save(c);
            }).toList();
            updateProfileCompletion(studentId);
            return SkillsDto.from(s, saved.stream().map(CertificationDto::from).toList());
        }

        List<Certification> certs = certificationRepository.findByStudentId(studentId);
        updateProfileCompletion(studentId);
        return SkillsDto.from(s, certs.stream().map(CertificationDto::from).toList());
    }

    // Achievements
    public List<AchievementDto> listAchievements(Long studentId) {
        return achievementRepository.findByStudentIdOrderByDateDesc(studentId)
                .stream().map(AchievementDto::from).toList();
    }

    @Transactional
    public AchievementDto addAchievement(Long studentId, AchievementInput input) {
        if (!studentRepository.existsById(studentId)) throw new NotFoundException("Student not found");
        Achievement a = new Achievement();
        a.setStudentId(studentId);
        a.setTitle(input.getTitle());
        a.setDescription(input.getDescription());
        if (input.getDate() != null && !input.getDate().isBlank()) a.setDate(LocalDate.parse(input.getDate()));
        a.setCategory(input.getCategory());
        a.setProof(input.getProof());
        a = achievementRepository.save(a);
        return AchievementDto.from(a);
    }

    @Transactional
    public void deleteAchievement(Long studentId, Long achievementId) {
        Achievement a = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new NotFoundException("Achievement not found"));
        if (!a.getStudentId().equals(studentId)) throw new NotFoundException("Achievement not found");
        achievementRepository.delete(a);
    }

    private void updateProfileCompletion(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) return;
        int score = 0;
        if (personalDetailsRepository.existsById(studentId)) score += 20;
        if (academicDetailsRepository.existsById(studentId)) score += 20;
        if (!experienceEntryRepository.findByStudentIdOrderByStartDateDesc(studentId).isEmpty()) score += 20;
        if (skillsDetailsRepository.existsById(studentId)) score += 20;
        if (!achievementRepository.findByStudentIdOrderByDateDesc(studentId).isEmpty()) score += 20;
        student.setProfileCompletionPercent(score);
        studentRepository.save(student);
    }

    private void log(String type, String description, String entityName) {
        ActivityLog log = new ActivityLog();
        log.setType(type);
        log.setDescription(description);
        log.setEntityName(entityName);
        activityLogRepository.save(log);
    }
}
