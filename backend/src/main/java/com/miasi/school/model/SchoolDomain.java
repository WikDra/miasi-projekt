package com.miasi.school.model;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public final class SchoolDomain {

    private SchoolDomain() {
    }

    public record Role(UUID id, String name) {
    }

    public record User(UUID id, String firstName, String lastName, String email, String passwordHash, String status,
                       List<String> roles) {

        public String fullName() {
            return firstName + " " + lastName;
        }
    }

    public record TeacherProfile(UUID id, UUID userId, String employeeNumber, String specialization) {
    }

    public record StudentProfile(UUID id, UUID userId, UUID parentId, UUID classId, String studentNumber) {
    }

    public record ParentProfile(UUID id, UUID userId, String phoneNumber) {
    }

    public record SecretaryProfile(UUID id, UUID userId, String officeRoom, String internalPhone) {
    }

    public record PrincipalProfile(UUID id, UUID userId, UUID teacherId, LocalDate nominationDate) {
    }

    public record SchoolClass(UUID id, UUID teacherId, String name, String schoolYear) {
    }

    public record Subject(UUID id, String name, String description) {
    }

    public record ScheduleEntry(UUID id, UUID classId, UUID teacherId, UUID subjectId, DayOfWeek dayOfWeek,
                                LocalTime startTime, LocalTime endTime, String roomNumber) {
    }

    public record ClassSession(UUID id, UUID scheduleId, LocalDate sessionDate, String topic, String status) {
    }

    public record AttendanceRecord(UUID id, UUID sessionId, UUID studentId, String status, String excuseComment) {
    }

    public record GradeRecord(UUID id, UUID studentId, UUID teacherId, UUID subjectId, BigDecimal decimalValue,
                              int weight, String type, String comment, LocalDate issuedAt, String category) {
    }

    public record Message(UUID id, UUID senderId, UUID recipientId, String title, String content, LocalDateTime sentAt) {
    }

    public record Notification(UUID id, UUID userId, String type, String content, boolean read, LocalDateTime createdAt) {
    }

    public record TeachingMaterial(UUID id, UUID teacherId, UUID classId, String title, String fileUrl,
                                   LocalDateTime publishedAt) {
    }

    public record DashboardSummary(int users, int teachers, int students, int classes, int unreadMessages,
                                   int unreadNotifications, int grades, int attendanceRecords) {
    }
}