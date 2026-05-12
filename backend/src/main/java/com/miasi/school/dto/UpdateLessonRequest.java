package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record UpdateLessonRequest(
        @NotNull(message = "Klasa jest wymagana")
        UUID classId,

        @NotNull(message = "Nauczyciel jest wymagany")
        UUID teacherId,

        @NotNull(message = "Przedmiot jest wymagany")
        UUID subjectId,

        @NotNull(message = "Dzień tygodnia jest wymagany")
        DayOfWeek dayOfWeek,

        @NotNull(message = "Godzina rozpoczęcia jest wymagana")
        LocalTime startTime,

        @NotNull(message = "Godzina zakończenia jest wymagana")
        LocalTime endTime,

        @NotBlank(message = "Numer sali jest wymagany")
        String roomNumber
) {
}