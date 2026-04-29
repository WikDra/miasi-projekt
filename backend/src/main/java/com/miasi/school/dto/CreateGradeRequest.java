package com.miasi.school.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateGradeRequest(
        @NotNull(message = "Uczeń jest wymagany")
        UUID studentId,

        @NotNull(message = "Nauczyciel jest wymagany")
        UUID teacherId,

        @NotNull(message = "Przedmiot jest wymagany")
        UUID subjectId,

        @NotNull(message = "Ocena jest wymagana")
        @DecimalMin(value = "1.0", message = "Ocena musi być większa lub równa 1")
        BigDecimal decimalValue,

        @Min(value = 1, message = "Waga musi być co najmniej 1")
        @Max(value = 10, message = "Waga nie może być większa niż 10")
        int weight,

        @NotBlank(message = "Typ oceny jest wymagany")
        String type,

        String comment
) {
}