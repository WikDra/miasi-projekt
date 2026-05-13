package com.miasi.school.service;

import com.miasi.school.dto.CreateMessageRequest;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class MessagingService {

    private final MessageRepository messageRepo;
    private final NotificationRepository notificationRepo;
    private final AuthService authService;
    private final UserRepository userRepo;
    private final TeacherProfileRepository teacherRepo;
    private final StudentProfileRepository studentRepo;
    private final ParentProfileRepository parentRepo;
    private final SchoolClassRepository classRepo;
    private final LessonRepository lessonRepo;

    public MessagingService(MessageRepository messageRepo,
                            NotificationRepository notificationRepo,
                            AuthService authService,
                            UserRepository userRepo,
                            TeacherProfileRepository teacherRepo,
                            StudentProfileRepository studentRepo,
                            ParentProfileRepository parentRepo,
                            SchoolClassRepository classRepo,
                            LessonRepository lessonRepo) {
        this.messageRepo = messageRepo;
        this.notificationRepo = notificationRepo;
        this.authService = authService;
        this.userRepo = userRepo;
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
        this.parentRepo = parentRepo;
        this.classRepo = classRepo;
        this.lessonRepo = lessonRepo;
    }

    @Transactional
    public SchoolDomain.Message createMessage(CreateMessageRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        UserEntity recipient = userRepo.findById(request.recipientId()).orElseThrow();
        if (!canSendMessage(actor, recipient)) {
            throw new AuthorizationFailedException("Nie możesz wysłać wiadomości do tego odbiorcy");
        }

        MessageEntity message = new MessageEntity(
                UUID.randomUUID(), actor.getId(), request.recipientId(), request.title(), request.content(), LocalDateTime.now()
        );
        return map(messageRepo.save(message));
    }

    @Transactional
    public SchoolDomain.Notification markNotificationAsRead(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        NotificationEntity notification = notificationRepo.findById(id).orElseThrow();
        if (!notification.getUserId().equals(actor.getId())) {
            throw new IllegalArgumentException("To nie jest Twoje powiadomienie");
        }
        notification.setRead(true);
        return map(notificationRepo.save(notification));
    }

    public void addNotification(UUID userId, String type, String content) {
        NotificationEntity notification = new NotificationEntity(
                UUID.randomUUID(), userId, type, content, false, LocalDateTime.now()
        );
        notificationRepo.save(notification);
    }

    private boolean canSendMessage(UserEntity actor, UserEntity recipient) {
        if (actor.getId().equals(recipient.getId())) {
            return false;
        }
        if (hasAnyRole(actor, "ADMIN", "DIRECTOR", "SECRETARY")) {
            return true;
        }
        if (hasAnyRole(recipient, "ADMIN", "DIRECTOR", "SECRETARY")) {
            return true;
        }

        Set<UUID> allowedUserIds = new HashSet<>();

        if (actor.getRoles().contains("TEACHER")) {
            teacherRepo.findByUserId(actor.getId()).ifPresent(teacher -> {
                allowedUserIds.addAll(studentUserIdsForTeacher(teacher.getId()));
                allowedUserIds.addAll(parentUserIdsForTeacher(teacher.getId()));
            });
        }

        if (actor.getRoles().contains("STUDENT")) {
            studentRepo.findByUserId(actor.getId()).ifPresent(student ->
                    allowedUserIds.addAll(teacherUserIdsForClass(student.getClassId())));
        }

        if (actor.getRoles().contains("PARENT")) {
            parentRepo.findByUserId(actor.getId()).ifPresent(parent ->
                    studentRepo.findByParentId(parent.getId()).forEach(student ->
                            allowedUserIds.addAll(teacherUserIdsForClass(student.getClassId()))));
        }

        return allowedUserIds.contains(recipient.getId());
    }

    private Set<UUID> studentUserIdsForTeacher(UUID teacherId) {
        Set<UUID> userIds = new HashSet<>();
        Set<UUID> classIds = classIdsForTeacher(teacherId);
        studentRepo.findAll().stream()
                .filter(student -> classIds.contains(student.getClassId()))
                .forEach(student -> userIds.add(student.getUserId()));
        return userIds;
    }

    private Set<UUID> parentUserIdsForTeacher(UUID teacherId) {
        Set<UUID> parentIds = new HashSet<>();
        Set<UUID> classIds = classIdsForTeacher(teacherId);
        studentRepo.findAll().stream()
                .filter(student -> classIds.contains(student.getClassId()) && student.getParentId() != null)
                .forEach(student -> parentIds.add(student.getParentId()));

        Set<UUID> userIds = new HashSet<>();
        parentRepo.findAllById(parentIds).forEach(parent -> userIds.add(parent.getUserId()));
        return userIds;
    }

    private Set<UUID> teacherUserIdsForClass(UUID classId) {
        Set<UUID> teacherIds = new HashSet<>();
        classRepo.findById(classId).ifPresent(schoolClass -> teacherIds.add(schoolClass.getTeacherId()));
        lessonRepo.findByClassId(classId).forEach(lesson -> teacherIds.add(lesson.getTeacherId()));

        Set<UUID> userIds = new HashSet<>();
        teacherRepo.findAllById(teacherIds).forEach(teacher -> userIds.add(teacher.getUserId()));
        return userIds;
    }

    private Set<UUID> classIdsForTeacher(UUID teacherId) {
        Set<UUID> classIds = new HashSet<>();
        classRepo.findByTeacherId(teacherId).forEach(schoolClass -> classIds.add(schoolClass.getId()));
        lessonRepo.findByTeacherId(teacherId).forEach(lesson -> classIds.add(lesson.getClassId()));
        return classIds;
    }

    private boolean hasAnyRole(UserEntity user, String... roles) {
        for (String role : roles) {
            if (user.getRoles().contains(role)) {
                return true;
            }
        }
        return false;
    }

    // -- Mappers --
    public SchoolDomain.Message map(MessageEntity e) {
        return new SchoolDomain.Message(e.getId(), e.getSenderId(), e.getRecipientId(), e.getTitle(), e.getContent(), e.getSentAt());
    }
    public SchoolDomain.Notification map(NotificationEntity e) {
        return new SchoolDomain.Notification(e.getId(), e.getUserId(), e.getType(), e.getContent(), e.isRead(), e.getCreatedAt());
    }
}
