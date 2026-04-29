package com.miasi.school.controller;

import com.miasi.school.dto.LoginRequest;
import com.miasi.school.dto.LoginResponse;
import com.miasi.school.service.DemoDataStore;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DemoDataStore demoDataStore;

    public AuthController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(demoDataStore.authenticate(request));
    }
}