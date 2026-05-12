package com.miasi.school.dto;

import jakarta.validation.constraints.NotBlank;

public record ExcuseAttendanceRequest(
        @NotBlank(message = "Komentarz jest wymagany")
        String excuseComment
) {
}