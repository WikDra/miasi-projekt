package com.miasi.school.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class SchoolEntities {

    @Entity
    @Table(name = "users")
    public static class UserEntity {
        @Id
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String passwordHash;
        private String status;

        @ElementCollection(fetch = FetchType.EAGER)
        @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
        @Column(name = "role")
        private List<String> roles;

        public UserEntity() {}

        public UserEntity(UUID id, String firstName, String lastName, String email, String passwordHash, String status, List<String> roles) {
            this.id = id; this.firstName = firstName; this.lastName = lastName; this.email = email;
            this.passwordHash = passwordHash; this.status = status; this.roles = roles;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
    }

    @Entity
    @Table(name = "teacher_profiles")
    public static class TeacherProfileEntity {
        @Id
        private UUID id;
        private UUID userId;
        private String employeeNumber;
        private String specialization;

        public TeacherProfileEntity() {}
        public TeacherProfileEntity(UUID id, UUID userId, String employeeNumber, String specialization) {
            this.id = id; this.userId = userId; this.employeeNumber = employeeNumber; this.specialization = specialization;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
    }

    @Entity
    @Table(name = "student_profiles")
    public static class StudentProfileEntity {
        @Id
        private UUID id;
        private UUID userId;
        private UUID parentId;
        private UUID classId;
        private String studentNumber;

        public StudentProfileEntity() {}
        public StudentProfileEntity(UUID id, UUID userId, UUID parentId, UUID classId, String studentNumber) {
            this.id = id; this.userId = userId; this.parentId = parentId; this.classId = classId; this.studentNumber = studentNumber;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getParentId() { return parentId; }
        public void setParentId(UUID parentId) { this.parentId = parentId; }
        public UUID getClassId() { return classId; }
        public void setClassId(UUID classId) { this.classId = classId; }
        public String getStudentNumber() { return studentNumber; }
        public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    }

    @Entity
    @Table(name = "parent_profiles")
    public static class ParentProfileEntity {
        @Id
        private UUID id;
        private UUID userId;
        private String phoneNumber;

        public ParentProfileEntity() {}
        public ParentProfileEntity(UUID id, UUID userId, String phoneNumber) {
            this.id = id; this.userId = userId; this.phoneNumber = phoneNumber;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    @Entity
    @Table(name = "secretary_profiles")
    public static class SecretaryProfileEntity {
        @Id
        private UUID id;
        private UUID userId;
        private String officeRoom;
        private String internalPhone;

        public SecretaryProfileEntity() {}
        public SecretaryProfileEntity(UUID id, UUID userId, String officeRoom, String internalPhone) {
            this.id = id; this.userId = userId; this.officeRoom = officeRoom; this.internalPhone = internalPhone;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getOfficeRoom() { return officeRoom; }
        public void setOfficeRoom(String officeRoom) { this.officeRoom = officeRoom; }
        public String getInternalPhone() { return internalPhone; }
        public void setInternalPhone(String internalPhone) { this.internalPhone = internalPhone; }
    }

    @Entity
    @Table(name = "principal_profiles")
    public static class PrincipalProfileEntity {
        @Id
        private UUID id;
        private UUID userId;
        private UUID teacherId;
        private LocalDate nominationDate;

        public PrincipalProfileEntity() {}
        public PrincipalProfileEntity(UUID id, UUID userId, UUID teacherId, LocalDate nominationDate) {
            this.id = id; this.userId = userId; this.teacherId = teacherId; this.nominationDate = nominationDate;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getTeacherId() { return teacherId; }
        public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
        public LocalDate getNominationDate() { return nominationDate; }
        public void setNominationDate(LocalDate nominationDate) { this.nominationDate = nominationDate; }
    }

    @Entity
    @Table(name = "classes")
    public static class SchoolClassEntity {
        @Id
        private UUID id;
        private UUID teacherId;
        private String name;
        private String schoolYear;

        public SchoolClassEntity() {}
        public SchoolClassEntity(UUID id, UUID teacherId, String name, String schoolYear) {
            this.id = id; this.teacherId = teacherId; this.name = name; this.schoolYear = schoolYear;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getTeacherId() { return teacherId; }
        public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSchoolYear() { return schoolYear; }
        public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }
    }

    @Entity
    @Table(name = "subjects")
    public static class SubjectEntity {
        @Id
        private UUID id;
        private String name;
        private String description;

        public SubjectEntity() {}
        public SubjectEntity(UUID id, String name, String description) {
            this.id = id; this.name = name; this.description = description;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    @Entity
    @Table(name = "lessons")
    public static class LessonEntity {
        @Id
        private UUID id;
        private UUID classId;
        private UUID teacherId;
        private UUID subjectId;
        @Enumerated(EnumType.STRING)
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private String roomNumber;

        public LessonEntity() {}
        public LessonEntity(UUID id, UUID classId, UUID teacherId, UUID subjectId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, String roomNumber) {
            this.id = id; this.classId = classId; this.teacherId = teacherId; this.subjectId = subjectId;
            this.dayOfWeek = dayOfWeek; this.startTime = startTime; this.endTime = endTime; this.roomNumber = roomNumber;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getClassId() { return classId; }
        public void setClassId(UUID classId) { this.classId = classId; }
        public UUID getTeacherId() { return teacherId; }
        public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
        public UUID getSubjectId() { return subjectId; }
        public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }
        public DayOfWeek getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    }

    @Entity
    @Table(name = "class_sessions")
    public static class ClassSessionEntity {
        @Id
        private UUID id;
        private UUID lessonId;
        private LocalDate sessionDate;
        private String topic;
        private String status;

        public ClassSessionEntity() {}
        public ClassSessionEntity(UUID id, UUID lessonId, LocalDate sessionDate, String topic, String status) {
            this.id = id; this.lessonId = lessonId; this.sessionDate = sessionDate; this.topic = topic; this.status = status;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getLessonId() { return lessonId; }
        public void setLessonId(UUID lessonId) { this.lessonId = lessonId; }
        public LocalDate getSessionDate() { return sessionDate; }
        public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @Entity
    @Table(name = "attendance_records")
    public static class AttendanceRecordEntity {
        @Id
        private UUID id;
        private UUID sessionId;
        private UUID studentId;
        private String status;
        private String excuseComment;

        public AttendanceRecordEntity() {}
        public AttendanceRecordEntity(UUID id, UUID sessionId, UUID studentId, String status, String excuseComment) {
            this.id = id; this.sessionId = sessionId; this.studentId = studentId; this.status = status; this.excuseComment = excuseComment;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getSessionId() { return sessionId; }
        public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
        public UUID getStudentId() { return studentId; }
        public void setStudentId(UUID studentId) { this.studentId = studentId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getExcuseComment() { return excuseComment; }
        public void setExcuseComment(String excuseComment) { this.excuseComment = excuseComment; }
    }

    @Entity
    @Table(name = "grade_records")
    public static class GradeRecordEntity {
        @Id
        private UUID id;
        private UUID studentId;
        private UUID teacherId;
        private UUID subjectId;
        private BigDecimal decimalValue;
        private int weight;
        private String type;
        private String comment;
        private LocalDate issuedAt;
        private String category;

        public GradeRecordEntity() {}
        public GradeRecordEntity(UUID id, UUID studentId, UUID teacherId, UUID subjectId, BigDecimal decimalValue, int weight, String type, String comment, LocalDate issuedAt, String category) {
            this.id = id; this.studentId = studentId; this.teacherId = teacherId; this.subjectId = subjectId;
            this.decimalValue = decimalValue; this.weight = weight; this.type = type; this.comment = comment;
            this.issuedAt = issuedAt; this.category = category;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getStudentId() { return studentId; }
        public void setStudentId(UUID studentId) { this.studentId = studentId; }
        public UUID getTeacherId() { return teacherId; }
        public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
        public UUID getSubjectId() { return subjectId; }
        public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }
        public BigDecimal getDecimalValue() { return decimalValue; }
        public void setDecimalValue(BigDecimal decimalValue) { this.decimalValue = decimalValue; }
        public int getWeight() { return weight; }
        public void setWeight(int weight) { this.weight = weight; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public LocalDate getIssuedAt() { return issuedAt; }
        public void setIssuedAt(LocalDate issuedAt) { this.issuedAt = issuedAt; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    @Entity
    @Table(name = "messages")
    public static class MessageEntity {
        @Id
        private UUID id;
        private UUID senderId;
        private UUID recipientId;
        private String title;
        private String content;
        private LocalDateTime sentAt;

        public MessageEntity() {}
        public MessageEntity(UUID id, UUID senderId, UUID recipientId, String title, String content, LocalDateTime sentAt) {
            this.id = id; this.senderId = senderId; this.recipientId = recipientId; this.title = title; this.content = content; this.sentAt = sentAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getSenderId() { return senderId; }
        public void setSenderId(UUID senderId) { this.senderId = senderId; }
        public UUID getRecipientId() { return recipientId; }
        public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getSentAt() { return sentAt; }
        public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    }

    @Entity
    @Table(name = "notifications")
    public static class NotificationEntity {
        @Id
        private UUID id;
        private UUID userId;
        private String type;
        private String content;
        @Column(name = "is_read")
        private boolean read;
        private LocalDateTime createdAt;

        public NotificationEntity() {}
        public NotificationEntity(UUID id, UUID userId, String type, String content, boolean read, LocalDateTime createdAt) {
            this.id = id; this.userId = userId; this.type = type; this.content = content; this.read = read; this.createdAt = createdAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    @Entity
    @Table(name = "teaching_materials")
    public static class TeachingMaterialEntity {
        @Id
        private UUID id;
        private UUID teacherId;
        private UUID classId;
        private String title;
        private String fileUrl;
        private LocalDateTime publishedAt;

        public TeachingMaterialEntity() {}
        public TeachingMaterialEntity(UUID id, UUID teacherId, UUID classId, String title, String fileUrl, LocalDateTime publishedAt) {
            this.id = id; this.teacherId = teacherId; this.classId = classId; this.title = title; this.fileUrl = fileUrl; this.publishedAt = publishedAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getTeacherId() { return teacherId; }
        public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
        public UUID getClassId() { return classId; }
        public void setClassId(UUID classId) { this.classId = classId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public LocalDateTime getPublishedAt() { return publishedAt; }
        public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    }

    @Entity
    @Table(name = "roles")
    public static class RoleEntity {
        @Id
        private UUID id;
        private String name;

        public RoleEntity() {}
        public RoleEntity(UUID id, String name) {
            this.id = id; this.name = name;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
