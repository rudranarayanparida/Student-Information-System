package com.studentinfo.repository;

import com.studentinfo.model.ExperienceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<ExperienceEntry, Long> {
    Optional<ExperienceEntry> findByIdAndStudentId(Long id, Long studentId);
}
