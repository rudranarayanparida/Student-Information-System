package com.sis.backend.service;

import com.sis.backend.dto.ActivityItemDto;
import com.sis.backend.dto.DashboardStatsDto;
import com.sis.backend.dto.DepartmentPlacementSummaryDto;
import com.sis.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final DriveRepository driveRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardStatsDto getStats(Long departmentId) {
        long total = departmentId != null
                ? studentRepository.countByDepartmentId(departmentId)
                : studentRepository.count();
        long placed = departmentId != null
                ? studentRepository.countByDepartmentIdAndPlacementStatus(departmentId, "PLACED")
                : studentRepository.countByPlacementStatus("PLACED");
        long activeDrives = driveRepository.countByStatusIn(List.of("UPCOMING", "ONGOING"));
        long deptCount = departmentRepository.count();
        long totalUsers = userRepository.count();
        double placementPct = total > 0 ? Math.round((placed * 1000.0) / total) / 10.0 : 0.0;

        return DashboardStatsDto.builder()
                .totalStudents(total)
                .placedStudents(placed)
                .activeDrives(activeDrives)
                .departmentsCount(deptCount)
                .placementPercentage(placementPct)
                .profileCompletionAvg(0.0)
                .totalUsers(totalUsers)
                .build();
    }

    public List<DepartmentPlacementSummaryDto> getPlacementSummary() {
        return departmentRepository.findAll().stream().map(d -> {
            long total = studentRepository.countByDepartmentId(d.getId());
            long placed = studentRepository.countByDepartmentIdAndPlacementStatus(d.getId(), "PLACED");
            double pct = total > 0 ? Math.round((placed * 1000.0) / total) / 10.0 : 0.0;
            return new DepartmentPlacementSummaryDto(d.getId(), d.getName(), d.getCode(), total, placed, pct);
        }).toList();
    }

    public List<ActivityItemDto> getRecentActivity() {
        return activityLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, 20))
                .stream().map(ActivityItemDto::from).toList();
    }
}
