package com.sis.backend.controller;

import com.sis.backend.dto.*;
import com.sis.backend.security.SisUserDetails;
import com.sis.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public StudentListResponse list(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String placementStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @AuthenticationPrincipal SisUserDetails principal) {
        // DEPT_PLACEMENT / SRC: restrict to their department
        Long deptFilter = departmentId;
        if (principal != null && ("DEPT_PLACEMENT".equals(principal.getRole()) || "SRC".equals(principal.getRole()))) {
            deptFilter = principal.getDepartmentId();
        }
        return studentService.listStudents(deptFilter, search, year, placementStatus, page, pageSize);
    }

    @GetMapping("/{studentId}")
    public StudentProfileDto get(@PathVariable Long studentId) {
        return studentService.getStudent(studentId);
    }

    @DeleteMapping("/{studentId}")
    public Map<String, String> delete(@PathVariable Long studentId) {
        studentService.deleteStudent(studentId);
        return Map.of("message", "Student deleted");
    }

    // Personal details
    @GetMapping("/{studentId}/personal")
    public PersonalDetailsDto getPersonal(@PathVariable Long studentId) {
        return studentService.getPersonalDetails(studentId);
    }

    @PutMapping("/{studentId}/personal")
    public PersonalDetailsDto upsertPersonal(@PathVariable Long studentId,
                                             @RequestBody PersonalDetailsDto input) {
        return studentService.upsertPersonalDetails(studentId, input);
    }

    // Academic details
    @GetMapping("/{studentId}/academic")
    public AcademicDetailsDto getAcademic(@PathVariable Long studentId) {
        return studentService.getAcademicDetails(studentId);
    }

    @PutMapping("/{studentId}/academic")
    public AcademicDetailsDto upsertAcademic(@PathVariable Long studentId,
                                              @RequestBody AcademicDetailsDto input) {
        return studentService.upsertAcademicDetails(studentId, input);
    }

    // Experience
    @GetMapping("/{studentId}/experience")
    public List<ExperienceDto> listExperience(@PathVariable Long studentId) {
        return studentService.listExperience(studentId);
    }

    @PostMapping("/{studentId}/experience")
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceDto addExperience(@PathVariable Long studentId,
                                       @RequestBody ExperienceInput input) {
        return studentService.addExperience(studentId, input);
    }

    @PatchMapping("/{studentId}/experience/{experienceId}")
    public ExperienceDto updateExperience(@PathVariable Long studentId,
                                          @PathVariable Long experienceId,
                                          @RequestBody ExperienceInput input) {
        return studentService.updateExperience(studentId, experienceId, input);
    }

    @DeleteMapping("/{studentId}/experience/{experienceId}")
    public Map<String, String> deleteExperience(@PathVariable Long studentId,
                                                 @PathVariable Long experienceId) {
        studentService.deleteExperience(studentId, experienceId);
        return Map.of("message", "Experience deleted");
    }

    // Skills
    @GetMapping("/{studentId}/skills")
    public SkillsDto getSkills(@PathVariable Long studentId) {
        return studentService.getSkillsDetails(studentId);
    }

    @PutMapping("/{studentId}/skills")
    public SkillsDto upsertSkills(@PathVariable Long studentId,
                                   @RequestBody SkillsInput input) {
        return studentService.upsertSkillsDetails(studentId, input);
    }

    // Achievements
    @GetMapping("/{studentId}/achievements")
    public List<AchievementDto> listAchievements(@PathVariable Long studentId) {
        return studentService.listAchievements(studentId);
    }

    @PostMapping("/{studentId}/achievements")
    @ResponseStatus(HttpStatus.CREATED)
    public AchievementDto addAchievement(@PathVariable Long studentId,
                                          @RequestBody AchievementInput input) {
        return studentService.addAchievement(studentId, input);
    }

    @DeleteMapping("/{studentId}/achievements/{achievementId}")
    public Map<String, String> deleteAchievement(@PathVariable Long studentId,
                                                  @PathVariable Long achievementId) {
        studentService.deleteAchievement(studentId, achievementId);
        return Map.of("message", "Achievement deleted");
    }

    // Export (returns a simple response — actual file generation can be added later)
    @GetMapping("/export")
    public Map<String, Object> export(@RequestParam(required = false) Long departmentId,
                                      @RequestParam(defaultValue = "CSV") String format) {
        long count = studentService.listStudents(departmentId, null, null, null, 1, 1).getTotal();
        return Map.of(
                "downloadUrl", "/api/students/export/download?departmentId=" + (departmentId != null ? departmentId : "") + "&format=" + format,
                "format", format,
                "count", count
        );
    }
}
