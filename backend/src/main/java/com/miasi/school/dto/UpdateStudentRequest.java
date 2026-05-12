package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateStudentRequest(
        @NotNull(message = "Użytkownik jest wymagany")
        UUID userId,

        UUID parentId,

        @NotNull(message = "Klasa jest wymagana")
        UUID classId,

        @NotBlank(message = "Numer ucznia jest wymagany")
        String studentNumber
) {
}