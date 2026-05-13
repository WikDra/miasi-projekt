package com.miasi.school.service;

import com.miasi.school.dto.BootstrapResponse;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BootstrapService {

    private final UserRepository userRepo;
    private final TeacherProfileRepository teacherRepo;
    private final StudentProfileRepository studentRepo;
    private final ParentProfileRepository parentRepo;
    private final SecretaryProfileRepository secretaryRepo;
    private final PrincipalProfileRepository principalRepo;
    private final SchoolClassRepository classRepo;
    private final SubjectRepository subjectRepo;
    private final LessonRepository lessonRepo;
    private final ClassSessionRepository sessionRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final GradeRecordRepository gradeRepo;
    private final MessageRepository messageRepo;
    private final NotificationRepository notificationRepo;
    private final TeachingMaterialRepository materialRepo;
    private final RoleRepository roleRepo;

    private final UserService userService;
    private final AcademicService academicService;
    private final EvaluationService evaluationService;
    private final MessagingService messagingService;
    private final AuthService authService;

    public BootstrapService(UserRepository userRepo,
                            TeacherProfileRepository teacherRepo,
                            StudentProfileRepository studentRepo,
                            ParentProfileRepository parentRepo,
                            SecretaryProfileRepository secretaryRepo,
                            PrincipalProfileRepository principalRepo,
                            SchoolClassRepository classRepo,
                            SubjectRepository subjectRepo,
                            LessonRepository lessonRepo,
                            ClassSessionRepository sessionRepo,
                            AttendanceRecordRepository attendanceRepo,
                            GradeRecordRepository gradeRepo,
                            MessageRepository messageRepo,
                            NotificationRepository notificationRepo,
                            TeachingMaterialRepository materialRepo,
                            RoleRepository roleRepo,
                            UserService userService,
                            AcademicService academicService,
                            EvaluationService evaluationService,
                            MessagingService messagingService,
                            AuthService authService) {
        this.userRepo = userRepo;
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
        this.parentRepo = parentRepo;
        this.secretaryRepo = secretaryRepo;
        this.principalRepo = principalRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.lessonRepo = lessonRepo;
        this.sessionRepo = sessionRepo;
        this.attendanceRepo = attendanceRepo;
        this.gradeRepo = gradeRepo;
        this.messageRepo = messageRepo;
        this.notificationRepo = notificationRepo;
        this.materialRepo = materialRepo;
        this.roleRepo = roleRepo;
        this.userService = userService;
        this.academicService = academicService;
        this.evaluationService = evaluationService;
        this.messagingService = messagingService;
        this.authService = authService;
    }

    public BootstrapResponse bootstrap(String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);

        if (hasAnyRole(actor, "ADMIN", "DIRECTOR", "SECRETARY")) {
            return buildResponse(
                    userRepo.findAll(),
                    teacherRepo.findAll(),
                    studentRepo.findAll(),
                    parentRepo.findAll(),
                    secretaryRepo.findAll(),
                    principalRepo.findAll(),
                    classRepo.findAll(),
                    subjectRepo.findAll(),
                    lessonRepo.findAll(),
                    sessionRepo.findAll(),
                    attendanceRepo.findAll(),
                    gradeRepo.findAll(),
                    messageRepo.findAll(),
                    notificationRepo.findAll(),
                    materialRepo.findAll()
            );
        }

        ScopedBootstrapData scoped = collectScopedData(actor);

        return buildResponse(
                userRepo.findAllById(scoped.userIds()),
                teacherRepo.findAllById(scoped.teacherIds()),
                studentRepo.findAllById(scoped.studentIds()),
                parentRepo.findAllById(scoped.parentIds()),
                List.of(),
                List.of(),
                classRepo.findAllById(scoped.classIds()),
                subjectRepo.findAllById(scoped.subjectIds()),
                lessonRepo.findAllById(scoped.lessonIds()),
                sessionRepo.findAllById(scoped.sessionIds()),
                attendanceRepo.findAllById(scoped.attendanceIds()),
                gradeRepo.findAllById(scoped.gradeIds()),
                messageRepo.findAllById(scoped.messageIds()),
                notificationRepo.findAllById(scoped.notificationIds()),
                materialRepo.findAllById(scoped.materialIds())
        );
    }

    private BootstrapResponse buildResponse(List<UserEntity> users,
                                            List<TeacherProfileEntity> teachers,
                                            List<StudentProfileEntity> students,
                                            List<ParentProfileEntity> parents,
                                            List<SecretaryProfileEntity> secretaries,
                                            List<PrincipalProfileEntity> principals,
                                            List<SchoolClassEntity> classes,
                                            List<SubjectEntity> subjects,
                                            List<LessonEntity> lessons,
                                            List<ClassSessionEntity> sessions,
                                            List<AttendanceRecordEntity> attendance,
                                            List<GradeRecordEntity> grades,
                                            List<MessageEntity> messages,
                                            List<NotificationEntity> notifications,
                                            List<TeachingMaterialEntity> materials) {

        return new BootstrapResponse(
                new SchoolDomain.DashboardSummary(
                        users.size(), teachers.size(), students.size(), classes.size(),
                        countUnreadMessages(messages), countUnreadNotifications(notifications), grades.size(), attendance.size()
                ),
                roleRepo.findAll().stream().map(e -> new SchoolDomain.Role(e.getId(), e.getName())).toList(),
                users.stream().map(userService::map).toList(),
                teachers.stream().map(userService::map).toList(),
                students.stream().map(userService::map).toList(),
                parents.stream().map(userService::map).toList(),
                secretaries.stream().map(userService::map).toList(),
                principals.stream().map(userService::map).toList(),
                classes.stream().map(academicService::map).toList(),
                subjects.stream().map(academicService::map).toList(),
                lessons.stream().map(academicService::map).toList(),
                sessions.stream().map(academicService::map).toList(),
                attendance.stream().map(evaluationService::map).toList(),
                grades.stream().map(evaluationService::map).toList(),
                messages.stream().map(messagingService::map).toList(),
                notifications.stream().map(messagingService::map).toList(),
                materials.stream().map(e -> new SchoolDomain.TeachingMaterial(e.getId(), e.getTeacherId(), e.getClassId(), e.getTitle(), e.getFileUrl(), e.getPublishedAt())).toList()
        );
    }

    private ScopedBootstrapData collectScopedData(UserEntity actor) {
        Set<UUID> userIds = new HashSet<>();
        Set<UUID> teacherIds = new HashSet<>();
        Set<UUID> studentIds = new HashSet<>();
        Set<UUID> parentIds = new HashSet<>();
        Set<UUID> classIds = new HashSet<>();
        Set<UUID> lessonIds = new HashSet<>();
        Set<UUID> sessionIds = new HashSet<>();
        Set<UUID> subjectIds = new HashSet<>();

        userIds.add(actor.getId());

        if (actor.getRoles().contains("TEACHER")) {
            teacherRepo.findByUserId(actor.getId()).ifPresent(teacher -> {
                teacherIds.add(teacher.getId());
                userIds.add(teacher.getUserId());
                classRepo.findAll().stream()
                        .filter(schoolClass -> teacher.getId().equals(schoolClass.getTeacherId()))
                        .forEach(schoolClass -> classIds.add(schoolClass.getId()));
                lessonRepo.findByTeacherId(teacher.getId()).forEach(lesson -> {
                    lessonIds.add(lesson.getId());
                    classIds.add(lesson.getClassId());
                    subjectIds.add(lesson.getSubjectId());
                });
            });
        }

        if (actor.getRoles().contains("STUDENT")) {
            studentRepo.findByUserId(actor.getId()).ifPresent(student -> {
                studentIds.add(student.getId());
                userIds.add(student.getUserId());
                classIds.add(student.getClassId());
                if (student.getParentId() != null) {
                    parentIds.add(student.getParentId());
                }
            });
        }

        if (actor.getRoles().contains("PARENT")) {
            parentRepo.findByUserId(actor.getId()).ifPresent(parent -> {
                parentIds.add(parent.getId());
                userIds.add(parent.getUserId());
                studentRepo.findByParentId(parent.getId()).forEach(student -> {
                    studentIds.add(student.getId());
                    userIds.add(student.getUserId());
                    classIds.add(student.getClassId());
                });
            });
        }

        studentRepo.findAll().stream()
                .filter(student -> classIds.contains(student.getClassId()))
                .forEach(student -> {
                    studentIds.add(student.getId());
                    userIds.add(student.getUserId());
                    if (student.getParentId() != null) {
                        parentIds.add(student.getParentId());
                    }
                });

        parentRepo.findAllById(parentIds).forEach(parent -> userIds.add(parent.getUserId()));

        lessonRepo.findAll().stream()
                .filter(lesson -> classIds.contains(lesson.getClassId()) || lessonIds.contains(lesson.getId()))
                .forEach(lesson -> {
                    lessonIds.add(lesson.getId());
                    classIds.add(lesson.getClassId());
                    teacherIds.add(lesson.getTeacherId());
                    subjectIds.add(lesson.getSubjectId());
                });

        teacherRepo.findAllById(teacherIds).forEach(teacher -> userIds.add(teacher.getUserId()));

        sessionRepo.findAll().stream()
                .filter(session -> lessonIds.contains(session.getLessonId()))
                .forEach(session -> sessionIds.add(session.getId()));

        List<GradeRecordEntity> visibleGrades = gradeRepo.findAll().stream()
                .filter(grade -> studentIds.contains(grade.getStudentId()) || teacherIds.contains(grade.getTeacherId()))
                .toList();
        Set<UUID> gradeIds = visibleGrades.stream().map(GradeRecordEntity::getId).collect(Collectors.toSet());
        visibleGrades.forEach(grade -> subjectIds.add(grade.getSubjectId()));

        Set<UUID> attendanceIds = attendanceRepo.findAll().stream()
                .filter(record -> studentIds.contains(record.getStudentId()) || sessionIds.contains(record.getSessionId()))
                .map(AttendanceRecordEntity::getId)
                .collect(Collectors.toSet());

        Set<UUID> messageIds = messageRepo.findAll().stream()
                .filter(message -> actor.getId().equals(message.getSenderId()) || actor.getId().equals(message.getRecipientId()))
                .peek(message -> {
                    userIds.add(message.getSenderId());
                    userIds.add(message.getRecipientId());
                })
                .map(MessageEntity::getId)
                .collect(Collectors.toSet());

        Set<UUID> notificationIds = notificationRepo.findAll().stream()
                .filter(notification -> actor.getId().equals(notification.getUserId()))
                .map(NotificationEntity::getId)
                .collect(Collectors.toSet());

        Set<UUID> materialIds = materialRepo.findAll().stream()
                .filter(material -> teacherIds.contains(material.getTeacherId()) || classIds.contains(material.getClassId()))
                .map(TeachingMaterialEntity::getId)
                .collect(Collectors.toSet());

        return new ScopedBootstrapData(userIds, teacherIds, studentIds, parentIds, classIds, subjectIds,
                lessonIds, sessionIds, attendanceIds, gradeIds, messageIds, notificationIds, materialIds);
    }

    private boolean hasAnyRole(UserEntity actor, String... roles) {
        for (String role : roles) {
            if (actor.getRoles().contains(role)) {
                return true;
            }
        }
        return false;
    }

    private int countUnreadMessages(List<MessageEntity> messages) {
        return messages.size();
    }

    private int countUnreadNotifications(List<NotificationEntity> notifications) {
        return (int) notifications.stream().filter(notification -> !notification.isRead()).count();
    }

    private record ScopedBootstrapData(Set<UUID> userIds,
                                       Set<UUID> teacherIds,
                                       Set<UUID> studentIds,
                                       Set<UUID> parentIds,
                                       Set<UUID> classIds,
                                       Set<UUID> subjectIds,
                                       Set<UUID> lessonIds,
                                       Set<UUID> sessionIds,
                                       Set<UUID> attendanceIds,
                                       Set<UUID> gradeIds,
                                       Set<UUID> messageIds,
                                       Set<UUID> notificationIds,
                                       Set<UUID> materialIds) {
    }
}
