package com.sis.backend.service;

import com.sis.backend.dto.*;
import com.sis.backend.entity.Student;
import com.sis.backend.entity.User;
import com.sis.backend.exception.BadRequestException;
import com.sis.backend.exception.NotFoundException;
import com.sis.backend.repository.ActivityLogRepository;
import com.sis.backend.repository.StudentRepository;
import com.sis.backend.repository.UserRepository;
import com.sis.backend.entity.ActivityLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserListResponse listUsers(String role, Long departmentId, int page, int pageSize) {
        String roleFilter = (role == null || role.isBlank()) ? null : role;
        Page<User> pageResult = userRepository.findByRoleAndDepartmentId(
                roleFilter, departmentId, PageRequest.of(page - 1, pageSize));
        List<UserDto> dtos = pageResult.getContent().stream().map(u -> {
            Student s = studentRepository.findByUserId(u.getId()).orElse(null);
            return UserDto.from(u, s != null ? s.getId() : null);
        }).toList();
        return new UserListResponse(dtos, pageResult.getTotalElements(), page, pageSize);
    }

    public UserDto getUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        Student s = studentRepository.findByUserId(id).orElse(null);
        return UserDto.from(user, s != null ? s.getId() : null);
    }

    @Transactional
    public UserDto createUser(UserInput input) {
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        User user = new User();
        user.setEmail(input.getEmail());
        user.setPasswordHash(passwordEncoder.encode(input.getPassword()));
        user.setRole(input.getRole());
        user.setFullName(input.getFullName());
        user.setDepartmentId(input.getDepartmentId());
        user = userRepository.save(user);

        Long studentId = null;
        if ("STUDENT".equals(input.getRole())) {
            Student student = new Student();
            student.setUserId(user.getId());
            student.setDepartmentId(input.getDepartmentId());
            student.setRollNumber(input.getRollNumber() != null ? input.getRollNumber()
                    : "ROLL-" + user.getId());
            student.setYear(input.getYear());
            student = studentRepository.save(student);
            studentId = student.getId();
        }

        log("USER_CREATED", "New user created: " + user.getEmail(), user.getFullName());
        return UserDto.from(user, studentId);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdate update) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        if (update.getEmail() != null) user.setEmail(update.getEmail());
        if (update.getFullName() != null) user.setFullName(update.getFullName());
        if (update.getRole() != null) user.setRole(update.getRole());
        if (update.getDepartmentId() != null) user.setDepartmentId(update.getDepartmentId());
        if (update.getPassword() != null && !update.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(update.getPassword()));
        }
        user = userRepository.save(user);
        Student s = studentRepository.findByUserId(id).orElse(null);
        return UserDto.from(user, s != null ? s.getId() : null);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        log("USER_DELETED", "User deleted: " + user.getEmail(), user.getFullName());
        userRepository.delete(user);
    }

    private void log(String type, String description, String entityName) {
        ActivityLog log = new ActivityLog();
        log.setType(type);
        log.setDescription(description);
        log.setEntityName(entityName);
        activityLogRepository.save(log);
    }
}
