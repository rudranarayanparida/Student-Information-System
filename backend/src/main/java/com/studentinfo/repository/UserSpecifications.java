package com.studentinfo.repository;

import com.studentinfo.model.User;
import com.studentinfo.config.Role;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {}

    public static Specification<User> withFilters(String role, Long departmentId) {
        return (root, query, builder) -> {
            Predicate predicate = builder.conjunction();

            if (role != null && !role.isBlank()) {
                predicate = builder.and(predicate, builder.equal(root.get("role"), Role.valueOf(role)));
            }
            if (departmentId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("department").get("id"), departmentId));
            }

            return predicate;
        };
    }
}
