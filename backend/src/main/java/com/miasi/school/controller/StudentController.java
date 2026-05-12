package com.miasi.school.controller;

import com.miasi.school.dto.CreateStudentRequest;
import com.miasi.school.dto.UpdateStudentRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final UserService userService;

    public StudentController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.StudentProfile> create(
            @Valid @RequestBody CreateStudentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createStudent(request, authorization));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDomain.StudentProfile> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStudentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(userService.updateStudent(id, request, authorization));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        userService.deleteStudent(id, authorization);
        return ResponseEntity.noContent().build();
    }
}
