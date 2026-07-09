package com.sis.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserListResponse {
    private List<UserDto> data;
    private long total;
    private int page;
    private int pageSize;
}
