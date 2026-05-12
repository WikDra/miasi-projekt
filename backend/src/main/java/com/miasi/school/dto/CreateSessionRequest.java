package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateSessionRequest(
        @NotNull UUID lessonId,
        @NotNull LocalDate sessionDate,
        @NotBlank String topic
) {
}
