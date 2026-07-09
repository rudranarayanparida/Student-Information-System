package com.studentinfo.controller;

import com.studentinfo.config.DriveStatus;
import com.studentinfo.config.JwtAuthenticationDetails;
import com.studentinfo.config.Role;
import com.studentinfo.config.SecurityUtils;
import com.studentinfo.dto.DriveRequest;
import com.studentinfo.dto.DriveUpdateRequest;
import com.studentinfo.dto.MessageResponse;
import com.studentinfo.model.Drive;
import com.studentinfo.model.Department;
import com.studentinfo.repository.DriveRepository;
import com.studentinfo.repository.DepartmentRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/drives")
public class DriveController {

    private final DriveRepository driveRepository;
    private final DepartmentRepository departmentRepository;

    public DriveController(DriveRepository driveRepository, DepartmentRepository departmentRepository) {
        this.driveRepository = driveRepository;
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Drive>> listDrives(@RequestParam(required = false) Long departmentId,
                                                  @RequestParam(required = false) String status) {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (details.getRole() == Role.DEPT_PLACEMENT || details.getRole() == Role.SRC) {
            departmentId = details.getDepartmentId();
        }
        Long effectiveDepartmentId = departmentId;

        List<Drive> drives = driveRepository.findAll(Sort.by("createdAt").descending());
        var filtered = drives.stream()
                .filter(drive -> effectiveDepartmentId == null || drive.getEligibleDepartments().contains(getDepartmentCodeForId(effectiveDepartmentId)))
                .filter(drive -> status == null || status.isBlank() || drive.getStatus().name().equalsIgnoreCase(status))
                .toList();
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{driveId}")
    public ResponseEntity<?> getDrive(@PathVariable Long driveId) {
        return driveRepository.findById(driveId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Drive not found")));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT','DEPT_PLACEMENT')")
    public ResponseEntity<?> createDrive(@Valid @RequestBody DriveRequest request) {
        Drive drive = Drive.builder()
                .title(request.getTitle())
                .company(request.getCompany())
                .description(request.getDescription())
                .eligibleDepartments(request.getEligibleDepartments() != null ? request.getEligibleDepartments() : List.of())
                .minCgpa(request.getMinCgpa())
                .minTenthPercent(request.getMinTenthPercent())
                .minTwelfthPercent(request.getMinTwelfthPercent())
                .maxBacklogs(request.getMaxBacklogs())
                .driveDate(request.getDriveDate())
                .applicationDeadline(request.getApplicationDeadline())
                .packageInfo(request.getPackageInfo())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .status(request.getStatus() != null ? DriveStatus.valueOf(request.getStatus()) : DriveStatus.UPCOMING)
                .build();
        driveRepository.save(drive);
        return ResponseEntity.status(HttpStatus.CREATED).body(drive);
    }

    @PatchMapping("/{driveId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT','DEPT_PLACEMENT')")
    public ResponseEntity<?> updateDrive(@PathVariable Long driveId, @Valid @RequestBody DriveUpdateRequest request) {
        return driveRepository.findById(driveId)
                .<ResponseEntity<?>>map(drive -> {
                    if (request.getTitle() != null) drive.setTitle(request.getTitle());
                    if (request.getCompany() != null) drive.setCompany(request.getCompany());
                    if (request.getDescription() != null) drive.setDescription(request.getDescription());
                    if (request.getEligibleDepartments() != null) drive.setEligibleDepartments(request.getEligibleDepartments());
                    if (request.getMinCgpa() != null) drive.setMinCgpa(request.getMinCgpa());
                    if (request.getMinTenthPercent() != null) drive.setMinTenthPercent(request.getMinTenthPercent());
                    if (request.getMinTwelfthPercent() != null) drive.setMinTwelfthPercent(request.getMinTwelfthPercent());
                    if (request.getMaxBacklogs() != null) drive.setMaxBacklogs(request.getMaxBacklogs());
                    if (request.getDriveDate() != null) drive.setDriveDate(request.getDriveDate());
                    if (request.getApplicationDeadline() != null) drive.setApplicationDeadline(request.getApplicationDeadline());
                    if (request.getPackageInfo() != null) drive.setPackageInfo(request.getPackageInfo());
                    if (request.getLocation() != null) drive.setLocation(request.getLocation());
                    if (request.getJobType() != null) drive.setJobType(request.getJobType());
                    if (request.getStatus() != null) drive.setStatus(DriveStatus.valueOf(request.getStatus()));
                    driveRepository.save(drive);
                    return ResponseEntity.ok(drive);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Drive not found")));
    }

    @DeleteMapping("/{driveId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT','DEPT_PLACEMENT')")
    public ResponseEntity<?> deleteDrive(@PathVariable Long driveId) {
        if (!driveRepository.existsById(driveId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Drive not found"));
        }
        driveRepository.deleteById(driveId);
        return ResponseEntity.ok(new MessageResponse("Drive deleted"));
    }

    private String getDepartmentCodeForId(Long departmentId) {
        return departmentRepository.findById(departmentId).map(Department::getCode).orElse("");
    }
}
