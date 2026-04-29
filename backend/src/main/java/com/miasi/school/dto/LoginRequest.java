package com.miasi.school.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "Podaj poprawny email")
        @NotBlank(message = "Email jest wymagany")
        String email,

        @NotBlank(message = "Hasło jest wymagane")
        String password
) {
}