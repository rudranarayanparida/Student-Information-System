package com.studentinfo.service;

import com.studentinfo.config.Role;
import com.studentinfo.model.Department;
import com.studentinfo.model.User;
import com.studentinfo.repository.DepartmentRepository;
import com.studentinfo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            Department cse = Department.builder().code("CSE").name("Computer Science").headName("Dr. Priya Rao").build();
            departmentRepository.save(cse);
            Department ece = Department.builder().code("ECE").name("Electronics & Communication").headName("Dr. Arun Sharma").build();
            departmentRepository.save(ece);
        }

        if (userRepository.count() == 0) {
            Department adminDept = departmentRepository.findById(1L).orElse(null);
            User admin = User.builder()
                    .email("admin@college.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .role(Role.SUPER_ADMIN)
                    .department(adminDept)
                    .build();
            userRepository.save(admin);
        }
    }
}
