package com.sis.backend.repository;

import com.sis.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE " +
           "(:departmentId IS NULL OR s.departmentId = :departmentId) AND " +
           "(:year IS NULL OR s.year = :year) AND " +
           "(:placementStatus IS NULL OR s.placementStatus = :placementStatus) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> findWithFilters(
            @Param("departmentId") Long departmentId,
            @Param("year") Integer year,
            @Param("placementStatus") String placementStatus,
            @Param("search") String search,
            Pageable pageable);

    long countByDepartmentId(Long departmentId);
    long countByPlacementStatus(String status);
    long countByDepartmentIdAndPlacementStatus(Long departmentId, String status);
}
