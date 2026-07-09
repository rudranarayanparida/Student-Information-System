package com.studentinfo.controller;

import com.studentinfo.dto.DepartmentRequest;
import com.studentinfo.dto.DepartmentUpdateRequest;
import com.studentinfo.dto.MessageResponse;
import com.studentinfo.model.Department;
import com.studentinfo.repository.DepartmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Department>> listDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{departmentId}")
    public ResponseEntity<?> getDepartment(@PathVariable Long departmentId) {
        return departmentRepository.findById(departmentId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Department not found")));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .headName(request.getHeadName())
                .build();
        departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(department);
    }

    @PatchMapping("/{departmentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long departmentId, @Valid @RequestBody DepartmentUpdateRequest request) {
        return departmentRepository.findById(departmentId)
                .<ResponseEntity<?>>map(department -> {
                    if (request.getName() != null) department.setName(request.getName());
                    if (request.getCode() != null) department.setCode(request.getCode());
                    if (request.getHeadName() != null) department.setHeadName(request.getHeadName());
                    departmentRepository.save(department);
                    return ResponseEntity.ok(department);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Department not found")));
    }

    @DeleteMapping("/{departmentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Department not found"));
        }
        departmentRepository.deleteById(departmentId);
        return ResponseEntity.ok(new MessageResponse("Department deleted"));
    }
}
