package com.studentinfo.controller;

import com.studentinfo.config.JwtAuthenticationDetails;
import com.studentinfo.config.PlacementStatus;
import com.studentinfo.config.Role;
import com.studentinfo.config.SecurityUtils;
import com.studentinfo.dto.*;
import com.studentinfo.model.*;
import com.studentinfo.repository.*;
import com.studentinfo.repository.StudentSpecifications;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@PreAuthorize("isAuthenticated()")
public class StudentController {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final ExperienceRepository experienceRepository;
    private final AchievementRepository achievementRepository;

    public StudentController(StudentRepository studentRepository,
                             DepartmentRepository departmentRepository,
                             ExperienceRepository experienceRepository,
                             AchievementRepository achievementRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.experienceRepository = experienceRepository;
        this.achievementRepository = achievementRepository;
    }

    @GetMapping
    public ResponseEntity<?> listStudents(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String placementStatus
    ) {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Role role = details.getRole();
        if (role == Role.DEPT_PLACEMENT || role == Role.SRC) {
            departmentId = details.getDepartmentId();
        } else if (role == Role.STUDENT) {
            Long studentId = details.getStudentId();
            if (studentId == null) {
                return ResponseEntity.ok(new PageResponse<List<Student>>(List.of(), 0, page, pageSize));
            }
            Optional<Student> student = studentRepository.findById(studentId);
            return student.map(value -> ResponseEntity.ok(new PageResponse<>(List.of(value), 1, page, pageSize)))
                    .orElseGet(() -> ResponseEntity.ok(new PageResponse<>(List.of(), 0, page, pageSize)));
        }

        var pageable = PageRequest.of(page, pageSize, Sort.by("fullName").ascending());
        var students = studentRepository.findAll(StudentSpecifications.withFilters(departmentId, search, year, placementStatus), pageable);
        return ResponseEntity.ok(new PageResponse<>(students.toList(), students.getTotalElements(), students.getNumber(), students.getSize()));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudent(@PathVariable Long studentId) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canAccessStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEPT_PLACEMENT')")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        studentRepository.deleteById(studentId);
        return ResponseEntity.ok(new MessageResponse("Student deleted"));
    }

    @GetMapping("/{studentId}/personal")
    public ResponseEntity<?> getPersonalDetails(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .filter(this::canAccessStudent)
                .<ResponseEntity<?>>map(student -> ResponseEntity.ok(student.getPersonalDetails()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Personal details not found")));
    }

    @PutMapping("/{studentId}/personal")
    public ResponseEntity<?> upsertPersonalDetails(@PathVariable Long studentId, @Valid @RequestBody PersonalDetailsInput request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }

        PersonalDetails details = student.getPersonalDetails();
        if (details == null) {
            details = PersonalDetails.builder().student(student).build();
            student.setPersonalDetails(details);
        }
        updatePersonalDetails(details, request);
        studentRepository.save(student);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/{studentId}/academic")
    public ResponseEntity<?> getAcademicDetails(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .filter(this::canAccessStudent)
                .<ResponseEntity<?>>map(student -> ResponseEntity.ok(student.getAcademicDetails()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Academic details not found")));
    }

    @PutMapping("/{studentId}/academic")
    public ResponseEntity<?> upsertAcademicDetails(@PathVariable Long studentId, @Valid @RequestBody AcademicDetailsInput request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }

        AcademicDetails details = student.getAcademicDetails();
        if (details == null) {
            details = AcademicDetails.builder().student(student).build();
            student.setAcademicDetails(details);
        }
        updateAcademicDetails(details, request);
        studentRepository.save(student);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/{studentId}/experience")
    public ResponseEntity<?> listExperience(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .filter(this::canAccessStudent)
                .<ResponseEntity<?>>map(student -> ResponseEntity.ok(student.getExperience()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found")));
    }

    @PostMapping("/{studentId}/experience")
    public ResponseEntity<?> addExperience(@PathVariable Long studentId, @Valid @RequestBody ExperienceInput request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        ExperienceEntry entry = ExperienceEntry.builder()
                .student(student)
                .type(com.studentinfo.config.ExperienceType.valueOf(request.getType()))
                .title(request.getTitle())
                .company(request.getCompany())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent() != null && request.getIsCurrent())
                .description(request.getDescription())
                .stipend(request.getStipend())
                .offerLetter(request.getOfferLetter() != null && request.getOfferLetter())
                .completionCertificate(request.getCompletionCertificate() != null && request.getCompletionCertificate())
                .build();
        student.getExperience().add(entry);
        studentRepository.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @PatchMapping("/{studentId}/experience/{experienceId}")
    public ResponseEntity<?> updateExperience(@PathVariable Long studentId,
                                              @PathVariable Long experienceId,
                                              @Valid @RequestBody ExperienceUpdateRequest request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        return experienceRepository.findByIdAndStudentId(experienceId, studentId)
                .<ResponseEntity<?>>map(entry -> {
                    if (request.getType() != null) {
                        entry.setType(com.studentinfo.config.ExperienceType.valueOf(request.getType()));
                    }
                    if (request.getTitle() != null) entry.setTitle(request.getTitle());
                    if (request.getCompany() != null) entry.setCompany(request.getCompany());
                    if (request.getLocation() != null) entry.setLocation(request.getLocation());
                    if (request.getStartDate() != null) entry.setStartDate(request.getStartDate());
                    if (request.getEndDate() != null) entry.setEndDate(request.getEndDate());
                    if (request.getIsCurrent() != null) entry.setIsCurrent(request.getIsCurrent());
                    if (request.getDescription() != null) entry.setDescription(request.getDescription());
                    if (request.getStipend() != null) entry.setStipend(request.getStipend());
                    if (request.getOfferLetter() != null) entry.setOfferLetter(request.getOfferLetter());
                    if (request.getCompletionCertificate() != null) entry.setCompletionCertificate(request.getCompletionCertificate());
                    experienceRepository.save(entry);
                    return ResponseEntity.ok(entry);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Experience entry not found")));
    }

    @DeleteMapping("/{studentId}/experience/{experienceId}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long studentId,
                                               @PathVariable Long experienceId) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        return experienceRepository.findByIdAndStudentId(experienceId, studentId)
                .map(entry -> {
                    experienceRepository.delete(entry);
                    return ResponseEntity.ok(new MessageResponse("Deleted"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Experience entry not found")));
    }

    @GetMapping("/{studentId}/skills")
    public ResponseEntity<?> getSkillsDetails(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .filter(this::canAccessStudent)
                .<ResponseEntity<?>>map(student -> ResponseEntity.ok(student.getSkillsDetails()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Skills details not found")));
    }

    @PutMapping("/{studentId}/skills")
    public ResponseEntity<?> upsertSkillsDetails(@PathVariable Long studentId, @Valid @RequestBody SkillsDetailsInput request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        SkillsDetails details = student.getSkillsDetails();
        if (details == null) {
            details = SkillsDetails.builder().student(student).build();
            student.setSkillsDetails(details);
        }
        SkillsDetails finalDetails = details;
        finalDetails.setTechnicalSkills(request.getTechnicalSkills() != null ? request.getTechnicalSkills() : List.of());
        finalDetails.setSoftSkills(request.getSoftSkills() != null ? request.getSoftSkills() : List.of());
        finalDetails.setLanguages(request.getLanguages() != null ? request.getLanguages() : List.of());
        finalDetails.setTools(request.getTools() != null ? request.getTools() : List.of());
        finalDetails.getCertifications().clear();
        if (request.getCertifications() != null) {
            finalDetails.getCertifications().addAll(request.getCertifications().stream()
                    .map(input -> Certification.builder()
                            .skillsDetails(finalDetails)
                            .name(input.getName())
                            .issuer(input.getIssuer())
                            .issueDate(input.getIssueDate())
                            .expiryDate(input.getExpiryDate())
                            .credentialId(input.getCredentialId())
                            .credentialUrl(input.getCredentialUrl())
                            .build())
                    .collect(Collectors.toList()));
        }
        studentRepository.save(student);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/{studentId}/achievements")
    public ResponseEntity<?> listAchievements(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .filter(this::canAccessStudent)
                .<ResponseEntity<?>>map(student -> ResponseEntity.ok(student.getAchievements()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found")));
    }

    @PostMapping("/{studentId}/achievements")
    public ResponseEntity<?> addAchievement(@PathVariable Long studentId, @Valid @RequestBody AchievementInput request) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        Achievement achievement = Achievement.builder()
                .student(student)
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .category(request.getCategory())
                .proof(request.getProof())
                .build();
        student.getAchievements().add(achievement);
        studentRepository.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(achievement);
    }

    @DeleteMapping("/{studentId}/achievements/{achievementId}")
    public ResponseEntity<?> deleteAchievement(@PathVariable Long studentId, @PathVariable Long achievementId) {
        Optional<Student> maybeStudent = studentRepository.findById(studentId);
        if (maybeStudent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Student not found"));
        }
        Student student = maybeStudent.get();
        if (!canUpdateStudent(student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied"));
        }
        return achievementRepository.findByIdAndStudentId(achievementId, studentId)
                .map(achievement -> {
                    achievementRepository.delete(achievement);
                    return ResponseEntity.ok(new MessageResponse("Deleted"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Achievement not found")));
    }

    @GetMapping("/export")
    public void exportStudents(@RequestParam(required = false) Long departmentId,
                               @RequestParam(required = false) String format,
                               @RequestParam(required = false) String search,
                               @RequestParam(required = false) Integer year,
                               @RequestParam(required = false) String placementStatus,
                               HttpServletResponse response) throws IOException {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return;
        }

        Role role = details.getRole();
        if (role == Role.DEPT_PLACEMENT || role == Role.SRC) {
            departmentId = details.getDepartmentId();
        }
        if (role == Role.STUDENT) {
            departmentId = null;
        }

        List<Student> students = studentRepository.findAll(StudentSpecifications.withFilters(departmentId, search, year, placementStatus));
        if (format == null || format.isBlank() || format.equalsIgnoreCase("CSV")) {
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=students_export.csv");
            writeCsv(students, response.getOutputStream());
        } else {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"downloadUrl\":\"/api/students/export?format=CSV\",\"format\":\"CSV\",\"count\":" + students.size() + "}");
        }
    }

    private void writeCsv(List<Student> students, OutputStream outputStream) throws IOException {
        String header = "Roll Number,Full Name,Email,Department,Year,Section,Placement Status,Profile Completion\n";
        outputStream.write(header.getBytes());
        for (Student student : students) {
            String line = String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                    safe(student.getRollNumber()),
                    safe(student.getFullName()),
                    safe(student.getEmail()),
                    safe(student.getDepartment() != null ? student.getDepartment().getName() : ""),
                    student.getYear() != null ? student.getYear() : "",
                    safe(student.getSection()),
                    student.getPlacementStatus() != null ? student.getPlacementStatus().name() : "",
                    student.getProfileCompletionPercent() != null ? student.getProfileCompletionPercent() : ""
            );
            outputStream.write(line.getBytes());
        }
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString().replaceAll("[\\r\\n,]", " ");
    }

    private boolean canAccessStudent(Student student) {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            return false;
        }
        Role role = details.getRole();
        if (role == Role.SUPER_ADMIN || role == Role.CENTRAL_PLACEMENT) {
            return true;
        }
        if (role == Role.DEPT_PLACEMENT || role == Role.SRC) {
            return student.getDepartment() != null && student.getDepartment().getId().equals(details.getDepartmentId());
        }
        if (role == Role.STUDENT) {
            return student.getId().equals(details.getStudentId());
        }
        return false;
    }

    private boolean canUpdateStudent(Student student) {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            return false;
        }
        Role role = details.getRole();
        if (role == Role.SUPER_ADMIN || role == Role.CENTRAL_PLACEMENT) {
            return true;
        }
        if (role == Role.DEPT_PLACEMENT) {
            return student.getDepartment() != null && student.getDepartment().getId().equals(details.getDepartmentId());
        }
        if (role == Role.STUDENT) {
            return student.getId().equals(details.getStudentId());
        }
        return false;
    }

    private void updatePersonalDetails(PersonalDetails details, PersonalDetailsInput request) {
        details.setDateOfBirth(request.getDateOfBirth());
        details.setGender(request.getGender());
        details.setPhone(request.getPhone());
        details.setAlternatePhone(request.getAlternatePhone());
        details.setPermanentAddress(request.getPermanentAddress());
        details.setCurrentAddress(request.getCurrentAddress());
        details.setCity(request.getCity());
        details.setState(request.getState());
        details.setPincode(request.getPincode());
        details.setNationality(request.getNationality());
        details.setCategory(request.getCategory());
        details.setAadharNumber(request.getAadharNumber());
        details.setPanNumber(request.getPanNumber());
        details.setLinkedinUrl(request.getLinkedinUrl());
        details.setGithubUrl(request.getGithubUrl());
        details.setPortfolioUrl(request.getPortfolioUrl());
    }

    private void updateAcademicDetails(AcademicDetails details, AcademicDetailsInput request) {
        details.setTenthBoard(request.getTenthBoard());
        details.setTenthSchool(request.getTenthSchool());
        details.setTenthPercentage(request.getTenthPercentage());
        details.setTenthYear(request.getTenthYear());
        details.setTwelfthBoard(request.getTwelfthBoard());
        details.setTwelfthSchool(request.getTwelfthSchool());
        details.setTwelfthPercentage(request.getTwelfthPercentage());
        details.setTwelfthYear(request.getTwelfthYear());
        details.setDiplomaInstitute(request.getDiplomaInstitute());
        details.setDiplomaPercentage(request.getDiplomaPercentage());
        details.setDiplomaYear(request.getDiplomaYear());
        details.setUgInstitute(request.getUgInstitute());
        details.setUgDegree(request.getUgDegree());
        details.setUgBranch(request.getUgBranch());
        details.setUgCgpa(request.getUgCgpa());
        details.setUgPassingYear(request.getUgPassingYear());
        details.setCurrentSemesterCgpa(request.getCurrentSemesterCgpa());
        details.setActiveBacklogs(request.getActiveBacklogs());
        details.setTotalBacklogs(request.getTotalBacklogs());
        details.setGapYears(request.getGapYears());
    }
}
