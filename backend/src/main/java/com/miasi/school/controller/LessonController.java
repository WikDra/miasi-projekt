package com.miasi.school.controller;

import com.miasi.school.dto.CreateLessonRequest;
import com.miasi.school.dto.UpdateLessonRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final DemoDataStore demoDataStore;

    public LessonController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.Lesson> create(
            @Valid @RequestBody CreateLessonRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(demoDataStore.createLesson(request, authorization));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<SchoolDomain.Lesson> update(
            @PathVariable UUID lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.updateLesson(lessonId, request, authorization));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID lessonId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        demoDataStore.deleteLesson(lessonId, authorization);
        return ResponseEntity.noContent().build();
    }
}