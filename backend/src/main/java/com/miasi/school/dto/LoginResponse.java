package com.miasi.school.dto;

import java.util.List;
import java.util.UUID;

public record LoginResponse(
        UUID userId,
        String fullName,
        String email,
        List<String> roles,
        String token
) {
}