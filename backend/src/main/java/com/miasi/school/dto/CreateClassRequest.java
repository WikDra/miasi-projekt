package com.miasi.school.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateClassRequest(
        @NotBlank(message = "Nazwa klasy jest wymagana")
        String name,

        @NotNull(message = "Wychowawca jest wymagany")
        UUID teacherId,

        @NotBlank(message = "Rok szkolny jest wymagany")
        String schoolYear
) {
}
