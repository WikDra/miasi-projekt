package com.miasi.school.controller;

import com.miasi.school.dto.CreateGradeRequest;
import com.miasi.school.dto.UpdateGradeRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    private final DemoDataStore demoDataStore;

    public GradeController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.GradeRecord> create(
            @Valid @RequestBody CreateGradeRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(demoDataStore.createGrade(request, authorization));
    }

    @PutMapping("/{gradeId}")
    public ResponseEntity<SchoolDomain.GradeRecord> update(
            @PathVariable UUID gradeId,
            @Valid @RequestBody UpdateGradeRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.updateGrade(gradeId, request, authorization));
    }

    @DeleteMapping("/{gradeId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID gradeId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        demoDataStore.deleteGrade(gradeId, authorization);
        return ResponseEntity.noContent().build();
    }
}