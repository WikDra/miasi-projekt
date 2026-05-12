package com.miasi.school.controller;

import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.MessagingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final MessagingService messagingService;

    public NotificationController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<SchoolDomain.Notification> markAsRead(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(messagingService.markNotificationAsRead(id, authorization));
    }
}
