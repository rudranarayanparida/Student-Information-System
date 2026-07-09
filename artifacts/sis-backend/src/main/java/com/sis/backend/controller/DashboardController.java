package com.sis.backend.controller;

import com.sis.backend.dto.ActivityItemDto;
import com.sis.backend.dto.DashboardStatsDto;
import com.sis.backend.dto.DepartmentPlacementSummaryDto;
import com.sis.backend.security.SisUserDetails;
import com.sis.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDto stats(
            @RequestParam(required = false) Long departmentId,
            @AuthenticationPrincipal SisUserDetails principal) {
        Long deptId = departmentId;
        if (principal != null && "DEPT_PLACEMENT".equals(principal.getRole())) {
            deptId = principal.getDepartmentId();
        }
        return dashboardService.getStats(deptId);
    }

    @GetMapping("/placement-summary")
    public List<DepartmentPlacementSummaryDto> placementSummary() {
        return dashboardService.getPlacementSummary();
    }

    @GetMapping("/recent-activity")
    public List<ActivityItemDto> recentActivity() {
        return dashboardService.getRecentActivity();
    }
}
