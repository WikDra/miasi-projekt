package com.miasi.school.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.dto.LoginResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void reportsRejectMissingToken() throws Exception {
        mockMvc.perform(get("/api/reports/attendance"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(get("/api/reports/grades"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void reportsRejectStudentAndParentRoles() throws Exception {
        LoginResponse student = login("student@school.local", "Student123!");
        LoginResponse parent = login("parent@school.local", "Parent123!");

        mockMvc.perform(get("/api/reports/attendance")
                        .header("Authorization", "Bearer " + student.token()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(get("/api/reports/grades")
                        .header("Authorization", "Bearer " + parent.token()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void reportsAllowDirectorRole() throws Exception {
        LoginResponse director = login("director@school.local", "Director123!");

        mockMvc.perform(get("/api/reports/attendance")
                        .header("Authorization", "Bearer " + director.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/reports/grades")
                        .header("Authorization", "Bearer " + director.token()))
                .andExpect(status().isOk());
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
