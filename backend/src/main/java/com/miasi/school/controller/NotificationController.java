package com.miasi.school.controller;

import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.DemoDataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final DemoDataStore demoDataStore;

    public NotificationController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<SchoolDomain.Notification> markAsRead(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(demoDataStore.markNotificationAsRead(id, authorization));
    }
}
