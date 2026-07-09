package com.sis.backend.repository;

import com.sis.backend.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByStudentIdOrderByDateDesc(Long studentId);
}
