package com.sis.backend.controller;

import com.sis.backend.dto.*;
import com.sis.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT')")
    public UserListResponse list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return userService.listUsers(role, departmentId, page, pageSize);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CENTRAL_PLACEMENT')")
    public UserDto get(@PathVariable Long userId) {
        return userService.getUser(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public UserDto create(@RequestBody UserInput input) {
        return userService.createUser(input);
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public UserDto update(@PathVariable Long userId, @RequestBody UserUpdate update) {
        return userService.updateUser(userId, update);
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, String> delete(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return Map.of("message", "User deleted successfully");
    }
}
