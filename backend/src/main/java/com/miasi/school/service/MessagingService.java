package com.miasi.school.service;

import com.miasi.school.dto.CreateMessageRequest;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.MessageRepository;
import com.miasi.school.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MessagingService {

    private final MessageRepository messageRepo;
    private final NotificationRepository notificationRepo;
    private final AuthService authService;

    public MessagingService(MessageRepository messageRepo,
                            NotificationRepository notificationRepo,
                            AuthService authService) {
        this.messageRepo = messageRepo;
        this.notificationRepo = notificationRepo;
        this.authService = authService;
    }

    @Transactional
    public SchoolDomain.Message createMessage(CreateMessageRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
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

    // -- Mappers --
    public SchoolDomain.Message map(MessageEntity e) {
        return new SchoolDomain.Message(e.getId(), e.getSenderId(), e.getRecipientId(), e.getTitle(), e.getContent(), e.getSentAt());
    }
    public SchoolDomain.Notification map(NotificationEntity e) {
        return new SchoolDomain.Notification(e.getId(), e.getUserId(), e.getType(), e.getContent(), e.isRead(), e.getCreatedAt());
    }
}
