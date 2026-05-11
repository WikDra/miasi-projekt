package com.miasi.school.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStudentRequest(
        @NotNull(message = "Użytkownik jest wymagany")
        UUID userId,

        UUID parentId,

        @NotNull(message = "Klasa jest wymagana")
        UUID classId,

        @NotBlank(message = "Numer ucznia jest wymagany")
        String studentNumber
) {
}
