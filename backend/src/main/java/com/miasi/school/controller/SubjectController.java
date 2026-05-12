package com.miasi.school.controller;

import com.miasi.school.dto.CreateSubjectRequest;
import com.miasi.school.dto.UpdateSubjectRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final DemoDataStore demoDataStore;

    public SubjectController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.Subject> create(
            @Valid @RequestBody CreateSubjectRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(demoDataStore.createSubject(request, authorization));
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SchoolDomain.Subject> update(
            @PathVariable UUID subjectId,
            @Valid @RequestBody UpdateSubjectRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.updateSubject(subjectId, request, authorization));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID subjectId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        demoDataStore.deleteSubject(subjectId, authorization);
        return ResponseEntity.noContent().build();
    }
}