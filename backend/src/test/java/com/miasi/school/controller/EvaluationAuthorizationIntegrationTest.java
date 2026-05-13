package com.miasi.school.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.dto.LoginResponse;
import com.miasi.school.entity.SchoolEntities.ClassSessionEntity;
import com.miasi.school.entity.SchoolEntities.StudentProfileEntity;
import com.miasi.school.entity.SchoolEntities.SubjectEntity;
import com.miasi.school.entity.SchoolEntities.TeacherProfileEntity;
import com.miasi.school.entity.SchoolEntities.UserEntity;
import com.miasi.school.repository.ClassSessionRepository;
import com.miasi.school.repository.StudentProfileRepository;
import com.miasi.school.repository.SubjectRepository;
import com.miasi.school.repository.TeacherProfileRepository;
import com.miasi.school.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EvaluationAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private TeacherProfileRepository teacherRepo;

    @Autowired
    private StudentProfileRepository studentRepo;

    @Autowired
    private SubjectRepository subjectRepo;

    @Autowired
    private ClassSessionRepository sessionRepo;

    @Test
    void teacherCannotCreateGradeForAnotherTeacherProfile() throws Exception {
        LoginResponse teacher = login("teacher@school.local", "Teacher123!");
        StudentProfileEntity student = firstStudent();
        SubjectEntity subject = firstSubject();

        mockMvc.perform(post("/api/grades")
                        .header("Authorization", "Bearer " + teacher.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "studentId", student.getId(),
                                "teacherId", UUID.randomUUID(),
                                "subjectId", subject.getId(),
                                "decimalValue", new BigDecimal("4.5"),
                                "weight", 2,
                                "type", "SPRAWDZIAN",
                                "comment", "test"
                        ))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void teacherCanCreateGradeForOwnTeacherProfile() throws Exception {
        LoginResponse teacherLogin = login("teacher@school.local", "Teacher123!");
        UserEntity teacherUser = userRepo.findByEmailIgnoreCase("teacher@school.local").orElseThrow();
        TeacherProfileEntity teacher = teacherRepo.findByUserId(teacherUser.getId()).orElseThrow();
        StudentProfileEntity student = firstStudent();
        SubjectEntity subject = firstSubject();

        mockMvc.perform(post("/api/grades")
                        .header("Authorization", "Bearer " + teacherLogin.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "studentId", student.getId(),
                                "teacherId", teacher.getId(),
                                "subjectId", subject.getId(),
                                "decimalValue", new BigDecimal("5.0"),
                                "weight", 1,
                                "type", "ODPOWIEDZ",
                                "comment", "test"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.teacherId").value(teacher.getId().toString()));
    }

    @Test
    void studentCannotExcuseAttendance() throws Exception {
        LoginResponse admin = login("admin@school.local", "Admin123!");
        LoginResponse student = login("student@school.local", "Student123!");
        UUID attendanceId = createAbsentAttendance(admin.token());

        mockMvc.perform(patch("/api/attendance/{attendanceId}/excuse", attendanceId)
                        .header("Authorization", "Bearer " + student.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("excuseComment", "test"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void parentCanExcuseOwnStudentAttendance() throws Exception {
        LoginResponse admin = login("admin@school.local", "Admin123!");
        LoginResponse parent = login("parent@school.local", "Parent123!");
        UUID attendanceId = createAbsentAttendance(admin.token());

        mockMvc.perform(patch("/api/attendance/{attendanceId}/excuse", attendanceId)
                        .header("Authorization", "Bearer " + parent.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("excuseComment", "Choroba"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXCUSED"))
                .andExpect(jsonPath("$.excuseComment").value("Choroba"));
    }

    private UUID createAbsentAttendance(String token) throws Exception {
        ClassSessionEntity session = sessionRepo.findAll().get(0);
        StudentProfileEntity student = firstStudent();

        String responseBody = mockMvc.perform(post("/api/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "sessionId", session.getId(),
                                "studentId", student.getId(),
                                "status", "ABSENT",
                                "excuseComment", ""
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode response = objectMapper.readTree(responseBody);
        return UUID.fromString(response.get("id").asText());
    }

    private StudentProfileEntity firstStudent() {
        return studentRepo.findAll().get(0);
    }

    private SubjectEntity firstSubject() {
        return subjectRepo.findAll().get(0);
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
