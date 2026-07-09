package com.sis.backend.dto;

import com.sis.backend.entity.ActivityLog;
import lombok.Data;

@Data
public class ActivityItemDto {
    private Long id;
    private String type;
    private String description;
    private String entityName;
    private String timestamp;

    public static ActivityItemDto from(ActivityLog a) {
        ActivityItemDto dto = new ActivityItemDto();
        dto.id = a.getId();
        dto.type = a.getType();
        dto.description = a.getDescription();
        dto.entityName = a.getEntityName();
        dto.timestamp = a.getTimestamp() != null ? a.getTimestamp().toString() : null;
        return dto;
    }
}
