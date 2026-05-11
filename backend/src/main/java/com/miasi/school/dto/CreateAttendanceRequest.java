package com.miasi.school.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAttendanceRequest(
        @NotNull(message = "Sesja jest wymagana")
        UUID sessionId,

        @NotNull(message = "Uczeń jest wymagany")
        UUID studentId,

        @NotBlank(message = "Status jest wymagany")
        String status,

        String excuseComment
) {
}
