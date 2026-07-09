package com.studentinfo.controller;

import com.studentinfo.config.JwtAuthenticationDetails;
import com.studentinfo.config.Role;
import com.studentinfo.config.SecurityUtils;
import com.studentinfo.dto.ActivityItemDto;
import com.studentinfo.dto.DashboardStats;
import com.studentinfo.dto.DepartmentPlacementSummaryDto;
import com.studentinfo.model.Department;
import com.studentinfo.model.Drive;
import com.studentinfo.model.Student;
import com.studentinfo.repository.DepartmentRepository;
import com.studentinfo.repository.DriveRepository;
import com.studentinfo.repository.StudentRepository;
import com.studentinfo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final DriveRepository driveRepository;
    private final UserRepository userRepository;

    public DashboardController(StudentRepository studentRepository,
                               DepartmentRepository departmentRepository,
                               DriveRepository driveRepository,
                               UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.driveRepository = driveRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(@RequestParam(required = false) Long departmentId) {
        JwtAuthenticationDetails details = SecurityUtils.getCurrentDetails();
        if (details == null) {
            return ResponseEntity.status(401).build();
        }
        Role role = details.getRole();
        if (role == Role.DEPT_PLACEMENT || role == Role.SRC) {
            departmentId = details.getDepartmentId();
        }
        Long effectiveDepartmentId = departmentId;

        List<Student> students = studentRepository.findAll();
        if (effectiveDepartmentId != null) {
            students = students.stream().filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(effectiveDepartmentId)).toList();
        }
        long totalStudents = students.size();
        long placedStudents = students.stream().filter(s -> s.getPlacementStatus() == com.studentinfo.config.PlacementStatus.PLACED).count();
        double placementPercentage = totalStudents == 0 ? 0 : (placedStudents * 100.0 / totalStudents);
        double profileCompletionAvg = totalStudents == 0 ? 0 : students.stream()
                .map(Student::getProfileCompletionPercent)
                .filter(value -> value != null)
                .mapToInt(Integer::intValue)
                .average().orElse(0);
        long activeDrives = driveRepository.findAll().stream()
                .filter(d -> d.getStatus() == com.studentinfo.config.DriveStatus.UPCOMING || d.getStatus() == com.studentinfo.config.DriveStatus.ONGOING)
                .count();
        long departmentsCount = departmentRepository.count();
        long totalUsers = userRepository.count();
        String avgPackage = driveRepository.findAll().stream()
                .map(Drive::getPackageInfo)
                .filter(pkg -> pkg != null && !pkg.isBlank())
                .findFirst()
                .orElse(null);

        DashboardStats stats = new DashboardStats(totalStudents, placedStudents, activeDrives, departmentsCount, placementPercentage, avgPackage, profileCompletionAvg, totalUsers);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/placement-summary")
    public ResponseEntity<List<DepartmentPlacementSummaryDto>> getPlacementSummary() {
        List<Department> departments = departmentRepository.findAll();
        List<Student> students = studentRepository.findAll();
        List<DepartmentPlacementSummaryDto> summary = departments.stream().map(dept -> {
            long total = students.stream().filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(dept.getId())).count();
            long placed = students.stream().filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(dept.getId()) && s.getPlacementStatus() == com.studentinfo.config.PlacementStatus.PLACED).count();
            double percentage = total == 0 ? 0 : (placed * 100.0 / total);
            return new DepartmentPlacementSummaryDto(dept.getId(), dept.getName(), dept.getCode(), total, placed, percentage);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<ActivityItemDto>> getRecentActivity() {
        var drives = driveRepository.findAll().stream()
                .sorted(Comparator.comparing(d -> d.getCreatedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(drive -> new ActivityItemDto(
                        drive.getId(),
                        "DRIVE",
                        "Placement drive created for " + drive.getCompany(),
                        drive.getTitle(),
                        drive.getCreatedAt() != null ? drive.getCreatedAt().toString() : OffsetDateTime.now().toString()
                ));

        List<ActivityItemDto> activity = new ArrayList<>(drives.toList());
        if (activity.size() < 5) {
            activity.add(new ActivityItemDto(999L, "SYSTEM", "Platform health check completed", null, OffsetDateTime.now().toString()));
        }
        return ResponseEntity.ok(activity);
    }
}
