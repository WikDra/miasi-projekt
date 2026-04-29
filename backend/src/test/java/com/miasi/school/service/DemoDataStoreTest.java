package com.miasi.school.service;

import com.miasi.school.dto.LoginRequest;
import com.miasi.school.dto.CreateGradeRequest;
import com.miasi.school.exception.AuthenticationFailedException;
import com.miasi.school.exception.AuthorizationFailedException;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DemoDataStoreTest {

    private final DemoDataStore demoDataStore = new DemoDataStore(new BCryptPasswordEncoder());

    @Test
    void bootstrapContainsSampleData() {
        assertEquals(6, demoDataStore.bootstrap().users().size());
        assertEquals(1, demoDataStore.bootstrap().classes().size());
    }

    @Test
    void authenticateReturnsDemoToken() {
        var result = demoDataStore.authenticate(new LoginRequest("teacher@school.local", "Teacher123!"));

        assertEquals("teacher@school.local", result.email());
        assertEquals(1, result.roles().size());
    }

    @Test
    void authenticateRejectsWrongPassword() {
        assertThrows(AuthenticationFailedException.class,
                () -> demoDataStore.authenticate(new LoginRequest("teacher@school.local", "bad-password")));
    }

    @Test
    void createGradeAddsGradeAndNotification() {
        var bootstrap = demoDataStore.bootstrap();
        var teacherToken = demoDataStore.authenticate(new LoginRequest("teacher@school.local", "Teacher123!")).token();
        var teacherId = bootstrap.teachers().get(0).id();
        var studentId = bootstrap.students().get(0).id();
        var subjectId = bootstrap.subjects().get(0).id();

        var created = demoDataStore.createGrade(new CreateGradeRequest(
                studentId,
                teacherId,
                subjectId,
                new BigDecimal("4.5"),
                2,
                "SPRAWDZIAN",
                "Dobra odpowiedź"
        ), teacherToken);

        assertEquals(studentId, created.studentId());
        assertEquals(bootstrap.grades().size() + 1, demoDataStore.bootstrap().grades().size());
        assertEquals(bootstrap.notifications().size() + 1, demoDataStore.bootstrap().notifications().size());
    }

    @Test
    void createGradeRejectsStudentToken() {
        var bootstrap = demoDataStore.bootstrap();
        var studentToken = demoDataStore.authenticate(new LoginRequest("student@school.local", "Student123!")).token();
        var teacherId = bootstrap.teachers().get(0).id();
        var studentId = bootstrap.students().get(0).id();
        var subjectId = bootstrap.subjects().get(0).id();

        assertThrows(AuthorizationFailedException.class, () -> demoDataStore.createGrade(new CreateGradeRequest(
                studentId,
                teacherId,
                subjectId,
                new BigDecimal("4.5"),
                2,
                "SPRAWDZIAN",
                "Dobra odpowiedź"
        ), studentToken));
    }
}