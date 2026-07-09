package com.studentinfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityItemDto {
    private Long id;
    private String type;
    private String description;
    private String entityName;
    private String timestamp;
}
