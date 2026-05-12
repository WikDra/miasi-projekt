package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateClassRequest(
        @NotBlank(message = "Nazwa klasy jest wymagana")
        String name,

        @NotNull(message = "Wychowawca jest wymagany")
        UUID teacherId,

        @NotBlank(message = "Rok szkolny jest wymagany")
        String schoolYear
) {
}