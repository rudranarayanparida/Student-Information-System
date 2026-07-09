package com.sis.backend.repository;

import com.sis.backend.entity.ExperienceEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceEntryRepository extends JpaRepository<ExperienceEntry, Long> {
    List<ExperienceEntry> findByStudentIdOrderByStartDateDesc(Long studentId);
}
