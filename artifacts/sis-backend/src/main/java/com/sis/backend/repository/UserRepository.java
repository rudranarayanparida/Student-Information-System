package com.sis.backend.repository;

import com.sis.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE (:role IS NULL OR u.role = :role) " +
           "AND (:departmentId IS NULL OR u.departmentId = :departmentId)")
    Page<User> findByRoleAndDepartmentId(String role, Long departmentId, Pageable pageable);
}
