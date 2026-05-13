package com.miasi.school.service;

import com.miasi.school.dto.BootstrapResponse;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

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
        authService.requireAuthorizedUser(authHeader);

        return new BootstrapResponse(
                new SchoolDomain.DashboardSummary(
                        (int)userRepo.count(), (int)teacherRepo.count(), (int)studentRepo.count(), (int)classRepo.count(),
                        0, 0, (int)gradeRepo.count(), (int)attendanceRepo.count()
                ),
                roleRepo.findAll().stream().map(e -> new SchoolDomain.Role(e.getId(), e.getName())).toList(),
                userRepo.findAll().stream().map(userService::map).toList(),
                teacherRepo.findAll().stream().map(userService::map).toList(),
                studentRepo.findAll().stream().map(userService::map).toList(),
                parentRepo.findAll().stream().map(userService::map).toList(),
                secretaryRepo.findAll().stream().map(userService::map).toList(),
                principalRepo.findAll().stream().map(userService::map).toList(),
                classRepo.findAll().stream().map(academicService::map).toList(),
                subjectRepo.findAll().stream().map(academicService::map).toList(),
                lessonRepo.findAll().stream().map(academicService::map).toList(),
                sessionRepo.findAll().stream().map(academicService::map).toList(),
                attendanceRepo.findAll().stream().map(evaluationService::map).toList(),
                gradeRepo.findAll().stream().map(evaluationService::map).toList(),
                messageRepo.findAll().stream().map(messagingService::map).toList(),
                notificationRepo.findAll().stream().map(messagingService::map).toList(),
                materialRepo.findAll().stream().map(e -> new SchoolDomain.TeachingMaterial(e.getId(), e.getTeacherId(), e.getClassId(), e.getTitle(), e.getFileUrl(), e.getPublishedAt())).toList()
        );
    }
}
