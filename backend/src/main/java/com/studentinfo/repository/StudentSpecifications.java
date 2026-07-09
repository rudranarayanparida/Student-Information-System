package com.studentinfo.repository;

import com.studentinfo.config.PlacementStatus;
import com.studentinfo.model.Student;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class StudentSpecifications {

    private StudentSpecifications() {}

    public static Specification<Student> withFilters(Long departmentId, String search, Integer year, String placementStatus) {
        return (root, query, builder) -> {
            Predicate predicate = builder.conjunction();

            if (departmentId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("department").get("id"), departmentId));
            }
            if (year != null) {
                predicate = builder.and(predicate, builder.equal(root.get("year"), year));
            }
            if (placementStatus != null && !placementStatus.isBlank()) {
                predicate = builder.and(predicate, builder.equal(root.get("placementStatus"), PlacementStatus.valueOf(placementStatus)));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicate = builder.and(predicate, builder.or(
                        builder.like(builder.lower(root.get("fullName")), pattern),
                        builder.like(builder.lower(root.get("email")), pattern),
                        builder.like(builder.lower(root.get("rollNumber")), pattern),
                        builder.like(builder.lower(root.get("department").get("name")), pattern)
                ));
            }

            return predicate;
        };
    }
}
