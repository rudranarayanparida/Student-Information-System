package com.sis.backend.service;

import com.sis.backend.dto.AuthResponse;
import com.sis.backend.dto.LoginRequest;
import com.sis.backend.dto.UserDto;
import com.sis.backend.entity.Student;
import com.sis.backend.entity.User;
import com.sis.backend.exception.BadRequestException;
import com.sis.backend.repository.StudentRepository;
import com.sis.backend.repository.UserRepository;
import com.sis.backend.security.JwtUtil;
import com.sis.backend.security.SisUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        Optional<Student> student = studentRepository.findByUserId(user.getId());
        Long studentId = student.map(Student::getId).orElse(null);

        String token = jwtUtil.generateToken(
                user.getId(), user.getEmail(), user.getRole(),
                studentId, user.getDepartmentId()
        );

        UserDto dto = UserDto.from(user, studentId);
        return new AuthResponse(token, dto);
    }

    public UserDto getCurrentUser(SisUserDetails principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        Optional<Student> student = studentRepository.findByUserId(user.getId());
        return UserDto.from(user, student.map(Student::getId).orElse(null));
    }
}
