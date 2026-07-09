package com.sis.backend.repository;

import com.sis.backend.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DriveRepository extends JpaRepository<Drive, Long> {

    @Query("SELECT d FROM Drive d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:departmentId IS NULL OR :departmentCode MEMBER OF d.eligibleDepartments OR d.eligibleDepartments IS EMPTY)")
    List<Drive> findWithFilters(@Param("status") String status,
                                @Param("departmentId") Long departmentId,
                                @Param("departmentCode") String departmentCode);

    long countByStatusIn(List<String> statuses);
}
