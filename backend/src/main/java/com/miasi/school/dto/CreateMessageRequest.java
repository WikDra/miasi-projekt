package com.miasi.school.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMessageRequest(
        @NotNull(message = "Odbiorca jest wymagany")
        UUID recipientId,

        @NotBlank(message = "Tytuł jest wymagany")
        String title,

        @NotBlank(message = "Treść jest wymagana")
        String content
) {
}
