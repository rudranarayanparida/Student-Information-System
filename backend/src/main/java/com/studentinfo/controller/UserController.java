package com.studentinfo.controller;

import com.studentinfo.config.Role;
import com.studentinfo.dto.MessageResponse;
import com.studentinfo.dto.UserRequest;
import com.studentinfo.dto.UserUpdateRequest;
import com.studentinfo.model.Department;
import com.studentinfo.model.User;
import com.studentinfo.repository.DepartmentRepository;
import com.studentinfo.repository.UserRepository;
import com.studentinfo.repository.UserSpecifications;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        var pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
        var users = userRepository.findAll(UserSpecifications.withFilters(role, departmentId), pageable);
        return ResponseEntity.ok(new com.studentinfo.dto.PageResponse<>(users.toList(), users.getTotalElements(), users.getNumber(), users.getSize()));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request) {
        if (userRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse("Email already in use"));
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        Role role = Role.valueOf(request.getRole());
        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .department(department)
                .build();
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found")));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody UserUpdateRequest request) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (request.getEmail() != null) {
                        user.setEmail(request.getEmail().trim().toLowerCase());
                    }
                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                    }
                    if (request.getFullName() != null) {
                        user.setFullName(request.getFullName());
                    }
                    if (request.getRole() != null) {
                        user.setRole(Role.valueOf(request.getRole()));
                    }
                    if (request.getDepartmentId() != null) {
                        Department dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
                        user.setDepartment(dept);
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found")));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted"));
    }
}
