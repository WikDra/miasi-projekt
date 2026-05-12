package com.miasi.school.controller;

import com.miasi.school.dto.CreateSessionRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.AcademicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final AcademicService academicService;

    public SessionController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.ClassSession> create(
            @Valid @RequestBody CreateSessionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicService.createSession(request, authorization));
    }
}
