package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.exception.AuthenticationFailedException;
import com.miasi.school.exception.AuthorizationFailedException;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

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
                studentId, teacherId, subjectId,
                new BigDecimal("4.5"), 2, "SPRAWDZIAN", "Dobra odpowiedź"
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
                studentId, teacherId, subjectId,
                new BigDecimal("4.5"), 2, "SPRAWDZIAN", "Dobra odpowiedź"
        ), studentToken));
    }

    @Test
    void createAttendanceRecordByTeacher() {
        var bootstrap = demoDataStore.bootstrap();
        var teacherToken = demoDataStore.authenticate(new LoginRequest("teacher@school.local", "Teacher123!")).token();
        var sessionId = bootstrap.classSessions().get(0).id();
        var studentId = bootstrap.students().get(0).id();

        var record = demoDataStore.createAttendance(
                new CreateAttendanceRequest(sessionId, studentId, "PRESENT", null), teacherToken);

        assertNotNull(record.id());
        assertEquals(com.miasi.school.model.SchoolDomain.AttendanceStatus.PRESENT, record.status());
    }

    @Test
    void createAttendanceRejectsStudent() {
        var bootstrap = demoDataStore.bootstrap();
        var studentToken = demoDataStore.authenticate(new LoginRequest("student@school.local", "Student123!")).token();
        var sessionId = bootstrap.classSessions().get(0).id();
        var studentId = bootstrap.students().get(0).id();

        assertThrows(AuthorizationFailedException.class, () ->
                demoDataStore.createAttendance(
                        new CreateAttendanceRequest(sessionId, studentId, "PRESENT", null), studentToken));
    }

    @Test
    void createMessageAddsNotification() {
        var bootstrap = demoDataStore.bootstrap();
        var teacherToken = demoDataStore.authenticate(new LoginRequest("teacher@school.local", "Teacher123!")).token();
        var recipientId = bootstrap.users().stream()
                .filter(u -> u.roles().contains("PARENT")).findFirst().orElseThrow().id();

        var message = demoDataStore.createMessage(
                new CreateMessageRequest(recipientId, "Test", "Treść testowa"), teacherToken);

        assertNotNull(message.id());
        assertTrue(demoDataStore.bootstrap().notifications().size() > bootstrap.notifications().size());
    }

    @Test
    void markNotificationAsRead() {
        var bootstrap = demoDataStore.bootstrap();
        var studentToken = demoDataStore.authenticate(new LoginRequest("student@school.local", "Student123!")).token();
        var notificationId = bootstrap.notifications().get(0).id();

        var updated = demoDataStore.markNotificationAsRead(notificationId, studentToken);
        assertTrue(updated.read());
    }

    @Test
    void createUserByAdmin() {
        var adminToken = demoDataStore.authenticate(new LoginRequest("admin@school.local", "Admin123!")).token();

        var user = demoDataStore.createUser(
                new CreateUserRequest("Test", "User", "test@school.local", "Test123!", List.of("STUDENT")),
                adminToken);

        assertEquals("Test", user.firstName());
        assertEquals(7, demoDataStore.bootstrap().users().size());
    }

    @Test
    void createUserRejectsNonAdmin() {
        var teacherToken = demoDataStore.authenticate(new LoginRequest("teacher@school.local", "Teacher123!")).token();

        assertThrows(AuthorizationFailedException.class, () ->
                demoDataStore.createUser(
                        new CreateUserRequest("Test", "User", "test2@school.local", "Test123!", List.of("STUDENT")),
                        teacherToken));
    }

    @Test
    void createClassBySecretary() {
        var bootstrap = demoDataStore.bootstrap();
        var secretaryToken = demoDataStore.authenticate(new LoginRequest("secretary@school.local", "Secretary123!")).token();
        var teacherId = bootstrap.users().stream()
                .filter(u -> u.roles().contains("TEACHER")).findFirst().orElseThrow().id();

        var schoolClass = demoDataStore.createClass(
                new CreateClassRequest("2B", teacherId, "2025/2026"), secretaryToken);

        assertEquals("2B", schoolClass.name());
        assertEquals(2, demoDataStore.bootstrap().classes().size());
    }

    @Test
    void attendanceReportForDirector() {
        var directorToken = demoDataStore.authenticate(new LoginRequest("director@school.local", "Director123!")).token();

        var report = demoDataStore.getAttendanceReport(directorToken);
        assertFalse(report.isEmpty());
    }

    @Test
    void gradesReportForDirector() {
        var directorToken = demoDataStore.authenticate(new LoginRequest("director@school.local", "Director123!")).token();

        var report = demoDataStore.getGradesReport(directorToken);
        assertFalse(report.isEmpty());
    }

    @Test
    void reportsRejectStudent() {
        var studentToken = demoDataStore.authenticate(new LoginRequest("student@school.local", "Student123!")).token();

        assertThrows(AuthorizationFailedException.class, () ->
                demoDataStore.getAttendanceReport(studentToken));
        assertThrows(AuthorizationFailedException.class, () ->
                demoDataStore.getGradesReport(studentToken));
    }
}