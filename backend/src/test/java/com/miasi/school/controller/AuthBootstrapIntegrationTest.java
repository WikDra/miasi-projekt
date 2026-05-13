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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthBootstrapIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginReturnsSignedJwtToken() throws Exception {
        LoginResponse response = login("teacher@school.local", "Teacher123!");

        assertNotNull(response.token());
        assertFalse(response.token().startsWith("demo-token-"));
        assertTrue(response.token().split("\\.", -1).length == 3);
    }

    @Test
    void bootstrapRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/bootstrap"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void bootstrapRejectsLegacyDemoToken() throws Exception {
        mockMvc.perform(get("/api/bootstrap")
                        .header("Authorization", "Bearer demo-token-00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void bootstrapAllowsSignedJwtToken() throws Exception {
        LoginResponse response = login("teacher@school.local", "Teacher123!");

        mockMvc.perform(get("/api/bootstrap")
                        .header("Authorization", "Bearer " + response.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.classes.length()", greaterThanOrEqualTo(1)));
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
