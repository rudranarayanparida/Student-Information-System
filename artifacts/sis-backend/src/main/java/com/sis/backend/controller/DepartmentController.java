package com.sis.backend.controller;

import com.sis.backend.dto.DepartmentDto;
import com.sis.backend.dto.DepartmentInput;
import com.sis.backend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<DepartmentDto> list() {
        return departmentService.listDepartments();
    }

    @GetMapping("/{departmentId}")
    public DepartmentDto get(@PathVariable Long departmentId) {
        return departmentService.getDepartment(departmentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT')")
    public DepartmentDto create(@RequestBody DepartmentInput input) {
        return departmentService.createDepartment(input);
    }

    @PatchMapping("/{departmentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT')")
    public DepartmentDto update(@PathVariable Long departmentId, @RequestBody DepartmentInput update) {
        return departmentService.updateDepartment(departmentId, update);
    }

    @DeleteMapping("/{departmentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, String> delete(@PathVariable Long departmentId) {
        departmentService.deleteDepartment(departmentId);
        return Map.of("message", "Department deleted");
    }
}
