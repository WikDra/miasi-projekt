package com.miasi.school.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.dto.LoginResponse;
import com.miasi.school.entity.SchoolEntities.StudentProfileEntity;
import com.miasi.school.entity.SchoolEntities.UserEntity;
import com.miasi.school.repository.StudentProfileRepository;
import com.miasi.school.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StudentSuspensionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentProfileRepository studentRepo;

    @Autowired
    private UserRepository userRepo;

    @Test
    void secretaryCanSuspendAndReactivateStudent() throws Exception {
        LoginResponse secretary = login("secretary@school.local", "Secretary123!");
        StudentProfileEntity student = studentRepo.findAll().get(0);

        mockMvc.perform(patch("/api/students/{id}/suspend", student.getId())
                        .header("Authorization", "Bearer " + secretary.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(student.getId().toString()));

        UserEntity suspendedUser = userRepo.findById(student.getUserId()).orElseThrow();
        assertEquals("INACTIVE", suspendedUser.getStatus());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "student@school.local",
                                  "password": "Student123!"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(patch("/api/students/{id}/reactivate", student.getId())
                        .header("Authorization", "Bearer " + secretary.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(student.getId().toString()));

        UserEntity activeUser = userRepo.findById(student.getUserId()).orElseThrow();
        assertEquals("ACTIVE", activeUser.getStatus());

        login("student@school.local", "Student123!");
    }

    @Test
    void teacherCannotSuspendStudent() throws Exception {
        LoginResponse teacher = login("teacher@school.local", "Teacher123!");
        StudentProfileEntity student = studentRepo.findAll().get(0);

        mockMvc.perform(patch("/api/students/{id}/suspend", student.getId())
                        .header("Authorization", "Bearer " + teacher.token()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
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
