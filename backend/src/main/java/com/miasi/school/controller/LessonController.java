package com.miasi.school.controller;

import com.miasi.school.dto.CreateLessonRequest;
import com.miasi.school.dto.UpdateLessonRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.AcademicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final AcademicService academicService;

    public LessonController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.Lesson> create(
            @Valid @RequestBody CreateLessonRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicService.createLesson(request, authorization));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<SchoolDomain.Lesson> update(
            @PathVariable UUID lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(academicService.updateLesson(lessonId, request, authorization));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID lessonId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        academicService.deleteLesson(lessonId, authorization);
        return ResponseEntity.noContent().build();
    }
}