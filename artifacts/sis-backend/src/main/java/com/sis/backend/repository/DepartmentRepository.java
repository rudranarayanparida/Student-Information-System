package com.sis.backend.repository;

import com.sis.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCode(String code);

    @Query("SELECT d.id, d.name, d.code, d.headName, " +
           "COUNT(DISTINCT s.id), COUNT(DISTINCT CASE WHEN s.placementStatus = 'PLACED' THEN s.id END) " +
           "FROM Department d LEFT JOIN Student s ON s.departmentId = d.id " +
           "GROUP BY d.id, d.name, d.code, d.headName")
    List<Object[]> findAllWithCounts();
}
