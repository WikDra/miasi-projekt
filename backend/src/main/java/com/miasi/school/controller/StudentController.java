package com.miasi.school.controller;

import com.miasi.school.dto.CreateStudentRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final DemoDataStore demoDataStore;

    public StudentController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.StudentProfile> create(
            @Valid @RequestBody CreateStudentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(demoDataStore.createStudent(request, authorization));
    }
}
