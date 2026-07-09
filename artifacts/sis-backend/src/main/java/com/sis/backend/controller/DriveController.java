package com.sis.backend.controller;

import com.sis.backend.dto.DriveDto;
import com.sis.backend.dto.DriveInput;
import com.sis.backend.security.SisUserDetails;
import com.sis.backend.service.DriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
@RequiredArgsConstructor
public class DriveController {

    private final DriveService driveService;

    @GetMapping
    public List<DriveDto> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long departmentId,
            @AuthenticationPrincipal SisUserDetails principal) {
        Long deptFilter = departmentId;
        if (principal != null && ("DEPT_PLACEMENT".equals(principal.getRole())
                || "SRC".equals(principal.getRole()) || "STUDENT".equals(principal.getRole()))) {
            deptFilter = principal.getDepartmentId();
        }
        return driveService.listDrives(status, deptFilter);
    }

    @GetMapping("/{driveId}")
    public DriveDto get(@PathVariable Long driveId) {
        return driveService.getDrive(driveId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DriveDto create(@RequestBody DriveInput input) {
        return driveService.createDrive(input);
    }

    @PatchMapping("/{driveId}")
    public DriveDto update(@PathVariable Long driveId, @RequestBody DriveInput update) {
        return driveService.updateDrive(driveId, update);
    }

    @DeleteMapping("/{driveId}")
    public Map<String, String> delete(@PathVariable Long driveId) {
        driveService.deleteDrive(driveId);
        return Map.of("message", "Drive deleted");
    }
}
