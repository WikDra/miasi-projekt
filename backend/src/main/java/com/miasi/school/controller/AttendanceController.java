package com.miasi.school.controller;

import com.miasi.school.dto.CreateAttendanceRequest;
import com.miasi.school.dto.ExcuseAttendanceRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final DemoDataStore demoDataStore;

    public AttendanceController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.AttendanceRecord> create(
            @Valid @RequestBody CreateAttendanceRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(demoDataStore.createAttendance(request, authorization));
    }

    @PatchMapping("/{attendanceId}/excuse")
    public ResponseEntity<SchoolDomain.AttendanceRecord> excuse(
            @PathVariable UUID attendanceId,
            @Valid @RequestBody ExcuseAttendanceRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.excuseAttendance(attendanceId, request, authorization));
    }
}
