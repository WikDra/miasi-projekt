package com.miasi.school.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CreateUserRequest(
        @NotBlank(message = "Imię jest wymagane")
        String firstName,

        @NotBlank(message = "Nazwisko jest wymagane")
        String lastName,

        @Email(message = "Podaj poprawny email")
        @NotBlank(message = "Email jest wymagany")
        String email,

        @NotBlank(message = "Hasło jest wymagane")
        String password,

        @NotEmpty(message = "Wymagana co najmniej jedna rola")
        List<String> roles
) {
}
