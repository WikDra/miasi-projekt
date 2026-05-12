package com.miasi.school.controller;

import com.miasi.school.dto.CreateClassRequest;
import com.miasi.school.dto.UpdateClassRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final DemoDataStore demoDataStore;

    public ClassController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.SchoolClass> create(
            @Valid @RequestBody CreateClassRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(demoDataStore.createClass(request, authorization));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDomain.SchoolClass> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClassRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.updateClass(id, request, authorization));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        demoDataStore.deleteClass(id, authorization);
        return ResponseEntity.noContent().build();
    }
}
