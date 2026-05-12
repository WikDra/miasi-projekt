package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateSubjectRequest(
        @NotBlank(message = "Nazwa jest wymagana")
        String name,

        @NotBlank(message = "Opis jest wymagany")
        String description
) {
}