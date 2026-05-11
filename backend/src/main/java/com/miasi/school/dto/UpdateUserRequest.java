package com.miasi.school.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank(message = "Imię jest wymagane")
        String firstName,

        @NotBlank(message = "Nazwisko jest wymagane")
        String lastName,

        @Email(message = "Podaj poprawny email")
        @NotBlank(message = "Email jest wymagany")
        String email,

        @NotBlank(message = "Status jest wymagany")
        String status,

        List<String> roles
) {
}
