package com.miasi.school.controller;

import com.miasi.school.dto.CreateMessageRequest;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.service.MessagingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessagingService messagingService;

    public MessageController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @PostMapping
    public ResponseEntity<SchoolDomain.Message> create(
            @Valid @RequestBody CreateMessageRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messagingService.createMessage(request, authorization));
    }
}
