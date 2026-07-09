package com.sis.backend.service;

import com.sis.backend.dto.DriveDto;
import com.sis.backend.dto.DriveInput;
import com.sis.backend.entity.ActivityLog;
import com.sis.backend.entity.Department;
import com.sis.backend.entity.Drive;
import com.sis.backend.exception.NotFoundException;
import com.sis.backend.repository.ActivityLogRepository;
import com.sis.backend.repository.DepartmentRepository;
import com.sis.backend.repository.DriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriveService {

    private final DriveRepository driveRepository;
    private final DepartmentRepository departmentRepository;
    private final ActivityLogRepository activityLogRepository;

    public List<DriveDto> listDrives(String status, Long departmentId) {
        String statusFilter = (status == null || status.isBlank()) ? null : status;
        String departmentCode = null;
        if (departmentId != null) {
            departmentCode = departmentRepository.findById(departmentId)
                    .map(Department::getCode).orElse(null);
        }
        return driveRepository.findWithFilters(statusFilter, departmentId, departmentCode)
                .stream().map(DriveDto::from).toList();
    }

    public DriveDto getDrive(Long id) {
        return DriveDto.from(driveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Drive not found")));
    }

    @Transactional
    public DriveDto createDrive(DriveInput input) {
        Drive drive = new Drive();
        applyInput(drive, input);
        drive = driveRepository.save(drive);
        log("DRIVE_CREATED", "New drive created: " + drive.getTitle(), drive.getCompany());
        return DriveDto.from(drive);
    }

    @Transactional
    public DriveDto updateDrive(Long id, DriveInput update) {
        Drive drive = driveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Drive not found"));
        applyInput(drive, update);
        drive = driveRepository.save(drive);
        log("DRIVE_UPDATED", "Drive updated: " + drive.getTitle(), drive.getCompany());
        return DriveDto.from(drive);
    }

    @Transactional
    public void deleteDrive(Long id) {
        Drive drive = driveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Drive not found"));
        log("DRIVE_DELETED", "Drive deleted: " + drive.getTitle(), drive.getCompany());
        driveRepository.delete(drive);
    }

    private void applyInput(Drive drive, DriveInput input) {
        if (input.getTitle() != null) drive.setTitle(input.getTitle());
        if (input.getCompany() != null) drive.setCompany(input.getCompany());
        if (input.getDescription() != null) drive.setDescription(input.getDescription());
        if (input.getEligibleDepartments() != null)
            drive.setEligibleDepartments(input.getEligibleDepartments().toArray(new String[0]));
        if (input.getMinCgpa() != null) drive.setMinCgpa(input.getMinCgpa());
        if (input.getMinTenthPercent() != null) drive.setMinTenthPercent(input.getMinTenthPercent());
        if (input.getMinTwelfthPercent() != null) drive.setMinTwelfthPercent(input.getMinTwelfthPercent());
        if (input.getMaxBacklogs() != null) drive.setMaxBacklogs(input.getMaxBacklogs());
        if (input.getDriveDate() != null && !input.getDriveDate().isBlank())
            drive.setDriveDate(LocalDate.parse(input.getDriveDate()));
        if (input.getApplicationDeadline() != null && !input.getApplicationDeadline().isBlank())
            drive.setApplicationDeadline(LocalDate.parse(input.getApplicationDeadline()));
        if (input.getPackageAmount() != null) drive.setPackageAmount(input.getPackageAmount());
        if (input.getLocation() != null) drive.setLocation(input.getLocation());
        if (input.getJobType() != null) drive.setJobType(input.getJobType());
        if (input.getStatus() != null) drive.setStatus(input.getStatus());
    }

    private void log(String type, String description, String entityName) {
        ActivityLog log = new ActivityLog();
        log.setType(type);
        log.setDescription(description);
        log.setEntityName(entityName);
        activityLogRepository.save(log);
    }
}
