package com.miasi.school.controller;

import com.miasi.school.dto.CreateUserRequest;
import com.miasi.school.dto.UpdateUserRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.User> create(
            @Valid @RequestBody CreateUserRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request, authorization));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDomain.User> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request, authorization));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        userService.deleteUser(id, authorization);
        return ResponseEntity.noContent().build();
    }
}
