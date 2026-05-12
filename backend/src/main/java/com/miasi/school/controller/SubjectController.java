package com.miasi.school.controller;

import com.miasi.school.dto.CreateSubjectRequest;
import com.miasi.school.dto.UpdateSubjectRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.AcademicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final AcademicService academicService;

    public SubjectController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.Subject> create(
            @Valid @RequestBody CreateSubjectRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicService.createSubject(request, authorization));
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SchoolDomain.Subject> update(
            @PathVariable UUID subjectId,
            @Valid @RequestBody UpdateSubjectRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(academicService.updateSubject(subjectId, request, authorization));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID subjectId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        academicService.deleteSubject(subjectId, authorization);
        return ResponseEntity.noContent().build();
    }
}