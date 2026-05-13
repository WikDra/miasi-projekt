package com.miasi.school.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.dto.LoginResponse;
import com.miasi.school.entity.SchoolEntities.UserEntity;
import com.miasi.school.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MessageAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepo;

    @Test
    void studentCanMessageOwnTeacher() throws Exception {
        LoginResponse student = login("student@school.local", "Student123!");
        UserEntity teacher = userRepo.findByEmailIgnoreCase("teacher@school.local").orElseThrow();

        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + student.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(messageJson(teacher.getId().toString())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recipientId").value(teacher.getId().toString()));
    }

    @Test
    void studentCannotMessageAnotherStudentByKnownId() throws Exception {
        LoginResponse admin = login("admin@school.local", "Admin123!");
        LoginResponse student = login("student@school.local", "Student123!");

        String otherStudentEmail = "other.student@school.local";
        String otherStudentId = createUser(admin.token(), otherStudentEmail, "Other", "Student", "STUDENT");

        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + student.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(messageJson(otherStudentId)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void adminCanMessageAnyUser() throws Exception {
        LoginResponse admin = login("admin@school.local", "Admin123!");
        UserEntity student = userRepo.findByEmailIgnoreCase("student@school.local").orElseThrow();

        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + admin.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(messageJson(student.getId().toString())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recipientId").value(student.getId().toString()));
    }

    private String createUser(String adminToken, String email, String firstName, String lastName, String role) throws Exception {
        String responseBody = mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "firstName", firstName,
                                "lastName", lastName,
                                "email", email,
                                "password", "Password123!",
                                "roles", new String[] { role }
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(responseBody).get("id").asText();
    }

    private String messageJson(String recipientId) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "recipientId", recipientId,
                "title", "Test",
                "content", "Test message"
        ));
    }

    private LoginResponse login(String email, String password) throws Exception {
        String responseBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readValue(responseBody, LoginResponse.class);
    }
}
