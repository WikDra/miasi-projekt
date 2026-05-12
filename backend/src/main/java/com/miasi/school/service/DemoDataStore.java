package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.exception.AuthenticationFailedException;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DemoDataStore {

    private final PasswordEncoder passwordEncoder;
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

    @Autowired
    public DemoDataStore(PasswordEncoder passwordEncoder,
                         UserRepository userRepo,
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
                         RoleRepository roleRepo) {
        this.passwordEncoder = passwordEncoder;
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
    }

    // -- Mappers --

    private SchoolDomain.User map(UserEntity e) {
        return new SchoolDomain.User(e.getId(), e.getFirstName(), e.getLastName(), e.getEmail(), e.getPasswordHash(), e.getStatus(), e.getRoles() != null ? new ArrayList<>(e.getRoles()) : List.of());
    }
    private SchoolDomain.TeacherProfile map(TeacherProfileEntity e) {
        return new SchoolDomain.TeacherProfile(e.getId(), e.getUserId(), e.getEmployeeNumber(), e.getSpecialization());
    }
    private SchoolDomain.StudentProfile map(StudentProfileEntity e) {
        return new SchoolDomain.StudentProfile(e.getId(), e.getUserId(), e.getParentId(), e.getClassId(), e.getStudentNumber());
    }
    private SchoolDomain.ParentProfile map(ParentProfileEntity e) {
        return new SchoolDomain.ParentProfile(e.getId(), e.getUserId(), e.getPhoneNumber());
    }
    private SchoolDomain.SecretaryProfile map(SecretaryProfileEntity e) {
        return new SchoolDomain.SecretaryProfile(e.getId(), e.getUserId(), e.getOfficeRoom(), e.getInternalPhone());
    }
    private SchoolDomain.PrincipalProfile map(PrincipalProfileEntity e) {
        return new SchoolDomain.PrincipalProfile(e.getId(), e.getUserId(), e.getTeacherId(), e.getNominationDate());
    }
    private SchoolDomain.SchoolClass map(SchoolClassEntity e) {
        return new SchoolDomain.SchoolClass(e.getId(), e.getTeacherId(), e.getName(), e.getSchoolYear());
    }
    private SchoolDomain.Subject map(SubjectEntity e) {
        return new SchoolDomain.Subject(e.getId(), e.getName(), e.getDescription());
    }
    private SchoolDomain.Lesson map(LessonEntity e) {
        return new SchoolDomain.Lesson(e.getId(), e.getClassId(), e.getTeacherId(), e.getSubjectId(), e.getDayOfWeek(), e.getStartTime(), e.getEndTime(), e.getRoomNumber());
    }
    private SchoolDomain.ClassSession map(ClassSessionEntity e) {
        return new SchoolDomain.ClassSession(e.getId(), e.getLessonId(), e.getSessionDate(), e.getTopic(), e.getStatus());
    }
    private SchoolDomain.AttendanceRecord map(AttendanceRecordEntity e) {
        return new SchoolDomain.AttendanceRecord(e.getId(), e.getSessionId(), e.getStudentId(), SchoolDomain.AttendanceStatus.valueOf(e.getStatus()), e.getExcuseComment());
    }
    private SchoolDomain.GradeRecord map(GradeRecordEntity e) {
        return new SchoolDomain.GradeRecord(e.getId(), e.getStudentId(), e.getTeacherId(), e.getSubjectId(), e.getDecimalValue(), e.getWeight(), e.getType(), e.getComment(), e.getIssuedAt(), e.getCategory());
    }
    private SchoolDomain.Message map(MessageEntity e) {
        return new SchoolDomain.Message(e.getId(), e.getSenderId(), e.getRecipientId(), e.getTitle(), e.getContent(), e.getSentAt());
    }
    private SchoolDomain.Notification map(NotificationEntity e) {
        return new SchoolDomain.Notification(e.getId(), e.getUserId(), e.getType(), e.getContent(), e.isRead(), e.getCreatedAt());
    }
    private SchoolDomain.TeachingMaterial map(TeachingMaterialEntity e) {
        return new SchoolDomain.TeachingMaterial(e.getId(), e.getTeacherId(), e.getClassId(), e.getTitle(), e.getFileUrl(), e.getPublishedAt());
    }
    private SchoolDomain.Role map(RoleEntity e) {
        return new SchoolDomain.Role(e.getId(), e.getName());
    }

    // -- Authentication --

    public LoginResponse authenticate(LoginRequest request) {
        System.out.println("Attempting login for: " + request.email());
        UserEntity user = userRepo.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + request.email());
                    return new AuthenticationFailedException("Nieprawidłowy email lub hasło");
                });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            System.out.println("Password mismatch for: " + request.email());
            throw new AuthenticationFailedException("Nieprawidłowy email lub hasło");
        }
        System.out.println("Login successful for: " + request.email());

        String fullName = user.getFirstName() + " " + user.getLastName();
        return new LoginResponse(user.getId(), fullName, user.getEmail(), user.getRoles(), "demo-token-" + user.getId());
    }

    private UserEntity requireAuthorizedUser(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        String tokenPrefix = "demo-token-";
        if (!token.startsWith(tokenPrefix)) {
            throw new AuthenticationFailedException("Nieprawidłowy token");
        }

        UUID userId;
        try {
            userId = UUID.fromString(token.substring(tokenPrefix.length()));
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationFailedException("Nieprawidłowy token");
        }

        return userRepo.findById(userId).orElseThrow(() -> new AuthenticationFailedException("Token wygasł"));
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return header != null ? header : "";
    }

    private void requireRole(UserEntity actor, String... allowedRoles) {
        for (String allowed : allowedRoles) {
            if (actor.getRoles() != null && actor.getRoles().contains(allowed)) return;
        }
        throw new AuthorizationFailedException("Brak uprawnień do wykonania tej operacji");
    }

    private void addNotification(UUID userId, String type, String content) {
        NotificationEntity notification = new NotificationEntity(
                UUID.randomUUID(), userId, type, content, false, LocalDateTime.now()
        );
        notificationRepo.save(notification);
    }

    // -- Users CRUD --

    public SchoolDomain.User createUser(CreateUserRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN");

        if (userRepo.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new IllegalArgumentException("Użytkownik z tym adresem email już istnieje");
        }

        UserEntity user = new UserEntity(
                UUID.randomUUID(), request.firstName().trim(), request.lastName().trim(),
                request.email().trim(), passwordEncoder.encode(request.password()),
                "ACTIVE", request.roles() != null ? new ArrayList<>(request.roles()) : new ArrayList<>()
        );
        userRepo.save(user);
        return map(user);
    }

    public SchoolDomain.User updateUser(UUID userId, UpdateUserRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN");

        UserEntity existing = userRepo.findById(userId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono użytkownika"));

        existing.setFirstName(request.firstName().trim());
        existing.setLastName(request.lastName().trim());
        existing.setEmail(request.email().trim());
        existing.setStatus(request.status().trim().toUpperCase());
        if (request.roles() != null) {
            existing.setRoles(new ArrayList<>(request.roles()));
        }
        userRepo.save(existing);
        return map(existing);
    }

    public void deleteUser(UUID userId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN");

        UserEntity existing = userRepo.findById(userId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono użytkownika"));

        StudentProfileEntity student = studentRepo.findByUserId(userId).orElse(null);
        if (student != null) deleteStudentInternal(student.getId());

        ParentProfileEntity parent = parentRepo.findByUserId(userId).orElse(null);
        if (parent != null) {
            if (!studentRepo.findByParentId(parent.getId()).isEmpty()) {
                throw new IllegalArgumentException("Nie można usunąć rodzica przypisanego do uczniów");
            }
            parentRepo.delete(parent);
        }

        secretaryRepo.findByUserId(userId).ifPresent(secretaryRepo::delete);
        principalRepo.findByUserId(userId).ifPresent(principalRepo::delete);

        TeacherProfileEntity teacher = teacherRepo.findByUserId(userId).orElse(null);
        if (teacher != null) {
            List<SchoolClassEntity> classes = classRepo.findByTeacherId(teacher.getId());
            for (SchoolClassEntity c : classes) deleteClassInternal(c.getId());

            List<LessonEntity> lessons = lessonRepo.findByTeacherId(teacher.getId());
            for (LessonEntity l : lessons) deleteLessonInternal(l.getId());

            teacherRepo.delete(teacher);
        }

        userRepo.delete(existing);
    }

    // -- Students CRUD --

    public SchoolDomain.StudentProfile createStudent(CreateStudentRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        userRepo.findById(request.userId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono użytkownika"));
        classRepo.findById(request.classId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono klasy"));

        StudentProfileEntity student = new StudentProfileEntity(
                UUID.randomUUID(), request.userId(), request.parentId(),
                request.classId(), request.studentNumber().trim()
        );
        studentRepo.save(student);
        return map(student);
    }

    public SchoolDomain.StudentProfile updateStudent(UUID studentId, UpdateStudentRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        StudentProfileEntity existing = studentRepo.findById(studentId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono ucznia"));
        userRepo.findById(request.userId()).orElseThrow();
        classRepo.findById(request.classId()).orElseThrow();
        if (request.parentId() != null) userRepo.findById(request.parentId()).orElseThrow();

        existing.setUserId(request.userId());
        existing.setParentId(request.parentId());
        existing.setClassId(request.classId());
        existing.setStudentNumber(request.studentNumber().trim());
        
        studentRepo.save(existing);
        return map(existing);
    }

    public void deleteStudent(UUID studentId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        deleteStudentInternal(studentId);
    }

    private void deleteStudentInternal(UUID studentId) {
        gradeRepo.findByStudentId(studentId).forEach(gradeRepo::delete);
        attendanceRepo.findByStudentId(studentId).forEach(attendanceRepo::delete);
        studentRepo.deleteById(studentId);
    }

    // -- Classes CRUD --

    public SchoolDomain.SchoolClass createClass(CreateClassRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        SchoolClassEntity schoolClass = new SchoolClassEntity(
                UUID.randomUUID(), request.teacherId(),
                request.name().trim(), request.schoolYear().trim()
        );
        classRepo.save(schoolClass);
        return map(schoolClass);
    }

    public SchoolDomain.SchoolClass updateClass(UUID classId, UpdateClassRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        SchoolClassEntity existing = classRepo.findById(classId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono klasy"));
        teacherRepo.findById(request.teacherId()).orElseThrow();

        existing.setTeacherId(request.teacherId());
        existing.setName(request.name().trim());
        existing.setSchoolYear(request.schoolYear().trim());
        
        classRepo.save(existing);
        return map(existing);
    }

    public void deleteClass(UUID classId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");
        deleteClassInternal(classId);
    }

    private void deleteClassInternal(UUID classId) {
        lessonRepo.findByClassId(classId).forEach(l -> deleteLessonInternal(l.getId()));
        studentRepo.findByClassId(classId).forEach(s -> deleteStudentInternal(s.getId()));
        classRepo.deleteById(classId);
    }

    // -- Subjects CRUD --

    public SchoolDomain.Subject createSubject(CreateSubjectRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR", "SECRETARY");

        if (subjectRepo.findByNameIgnoreCase(request.name().trim()).isPresent()) {
            throw new IllegalArgumentException("Przedmiot o takiej nazwie już istnieje");
        }

        SubjectEntity subject = new SubjectEntity(UUID.randomUUID(), request.name().trim(), request.description().trim());
        subjectRepo.save(subject);
        return map(subject);
    }

    public SchoolDomain.Subject updateSubject(UUID subjectId, UpdateSubjectRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR", "SECRETARY");

        SubjectEntity existing = subjectRepo.findById(subjectId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono przedmiotu"));
        existing.setName(request.name().trim());
        existing.setDescription(request.description().trim());
        subjectRepo.save(existing);
        return map(existing);
    }

    public void deleteSubject(UUID subjectId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR", "SECRETARY");

        lessonRepo.findBySubjectId(subjectId).forEach(l -> deleteLessonInternal(l.getId()));
        gradeRepo.findBySubjectId(subjectId).forEach(gradeRepo::delete);
        subjectRepo.deleteById(subjectId);
    }

    // -- Lessons CRUD --

    public SchoolDomain.Lesson createLesson(CreateLessonRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireLessonManager(actor, request.teacherId());

        LessonEntity lesson = new LessonEntity(UUID.randomUUID(), request.classId(), request.teacherId(), request.subjectId(),
                request.dayOfWeek(), request.startTime(), request.endTime(), request.roomNumber().trim());
        lessonRepo.save(lesson);
        return map(lesson);
    }

    public SchoolDomain.Lesson updateLesson(UUID lessonId, UpdateLessonRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireLessonManager(actor, request.teacherId());

        LessonEntity existing = lessonRepo.findById(lessonId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono lekcji"));
        existing.setClassId(request.classId());
        existing.setTeacherId(request.teacherId());
        existing.setSubjectId(request.subjectId());
        existing.setDayOfWeek(request.dayOfWeek());
        existing.setStartTime(request.startTime());
        existing.setEndTime(request.endTime());
        existing.setRoomNumber(request.roomNumber().trim());
        lessonRepo.save(existing);
        return map(existing);
    }

    public void deleteLesson(UUID lessonId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        LessonEntity existing = lessonRepo.findById(lessonId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono lekcji"));
        requireLessonManager(actor, existing.getTeacherId());

        deleteLessonInternal(lessonId);
    }

    private void deleteLessonInternal(UUID lessonId) {
        sessionRepo.findByLessonId(lessonId).forEach(s -> {
            attendanceRepo.findBySessionId(s.getId()).forEach(attendanceRepo::delete);
            sessionRepo.delete(s);
        });
        lessonRepo.deleteById(lessonId);
    }

    private void requireLessonManager(UserEntity actor, UUID requestedTeacherId) {
        if (actor.getRoles().contains("ADMIN") || actor.getRoles().contains("DIRECTOR") || actor.getRoles().contains("SECRETARY")) {
            return;
        }
        if (!actor.getRoles().contains("TEACHER")) {
            throw new AuthorizationFailedException("Tylko nauczyciel lub administracja może zarządzać planem lekcji");
        }
        TeacherProfileEntity actorTeacher = teacherRepo.findByUserId(actor.getId()).orElseThrow(() -> new AuthorizationFailedException("Zalogowany nauczyciel nie ma przypisanego profilu"));
        if (!actorTeacher.getId().equals(requestedTeacherId)) {
            throw new AuthorizationFailedException("Nauczyciel może zarządzać tylko własnym planem lekcji");
        }
    }

    // -- Sessions --

    public SchoolDomain.ClassSession createSession(CreateSessionRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        LessonEntity lesson = lessonRepo.findById(request.lessonId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono lekcji"));
        requireLessonManager(actor, lesson.getTeacherId());

        ClassSessionEntity session = new ClassSessionEntity(
                UUID.randomUUID(), lesson.getId(), request.sessionDate(), request.topic().trim(), "SCHEDULED"
        );
        sessionRepo.save(session);
        return map(session);
    }

    // -- Grades --

    public SchoolDomain.GradeRecord createGrade(CreateGradeRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        StudentProfileEntity student = studentRepo.findById(request.studentId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono ucznia"));
        SubjectEntity subject = subjectRepo.findById(request.subjectId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono przedmiotu"));
        
        GradeRecordEntity grade = new GradeRecordEntity(
                UUID.randomUUID(), student.getId(), request.teacherId(), subject.getId(),
                request.decimalValue(), request.weight(),
                request.type().trim().toUpperCase(),
                request.comment() == null ? "" : request.comment().trim(),
                LocalDate.now(), "CURRENT"
        );
        gradeRepo.save(grade);

        addNotification(student.getUserId(), "GRADE", "Dodano nową ocenę: " + grade.getDecimalValue() + " z " + subject.getName());
        return map(grade);
    }

    public SchoolDomain.GradeRecord updateGrade(UUID gradeId, UpdateGradeRequest request, String authorizationHeader) {
        requireAuthorizedUser(authorizationHeader);
        GradeRecordEntity existing = gradeRepo.findById(gradeId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono oceny"));
        existing.setDecimalValue(request.decimalValue());
        existing.setWeight(request.weight());
        existing.setType(request.type().trim().toUpperCase());
        existing.setComment(request.comment() == null ? "" : request.comment().trim());
        gradeRepo.save(existing);
        return map(existing);
    }

    public void deleteGrade(UUID gradeId, String authorizationHeader) {
        requireAuthorizedUser(authorizationHeader);
        gradeRepo.deleteById(gradeId);
    }

    // -- Attendance --

    public SchoolDomain.AttendanceRecord createAttendance(CreateAttendanceRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "TEACHER", "ADMIN", "DIRECTOR");

        sessionRepo.findById(request.sessionId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono sesji lekcyjnej"));
        studentRepo.findById(request.studentId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono ucznia"));

        AttendanceRecordEntity record = new AttendanceRecordEntity(
                UUID.randomUUID(), request.sessionId(), request.studentId(),
                request.status().trim().toUpperCase(), request.excuseComment()
        );
        attendanceRepo.save(record);

        StudentProfileEntity student = studentRepo.findById(request.studentId()).orElse(null);
        if (student != null) {
            addNotification(student.getUserId(), "ATTENDANCE", "Zarejestrowano frekwencję: " + record.getStatus());
        }
        return map(record);
    }

    public SchoolDomain.AttendanceRecord excuseAttendance(UUID attendanceId, ExcuseAttendanceRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        AttendanceRecordEntity existing = attendanceRepo.findById(attendanceId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono wpisu frekwencji"));
        
        existing.setStatus(SchoolDomain.AttendanceStatus.EXCUSED.name());
        existing.setExcuseComment(request.excuseComment().trim());
        attendanceRepo.save(existing);
        return map(existing);
    }

    // -- Messages --

    public SchoolDomain.Message createMessage(CreateMessageRequest request, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        userRepo.findById(request.recipientId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono odbiorcy"));

        MessageEntity message = new MessageEntity(UUID.randomUUID(), actor.getId(), request.recipientId(),
                request.title().trim(), request.content().trim(), LocalDateTime.now());
        messageRepo.save(message);

        addNotification(request.recipientId(), "MESSAGE", "Nowa wiadomość: " + message.getTitle());
        return map(message);
    }

    // -- Notifications --

    public SchoolDomain.Notification markNotificationAsRead(UUID notificationId, String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        NotificationEntity existing = notificationRepo.findById(notificationId).orElseThrow(() -> new NoSuchElementException("Nie znaleziono powiadomienia"));
        if (!existing.getUserId().equals(actor.getId())) {
            throw new AuthorizationFailedException("Brak dostępu do tego powiadomienia");
        }
        existing.setRead(true);
        notificationRepo.save(existing);
        return map(existing);
    }

    // -- Reports --

    public List<AttendanceReportEntry> getAttendanceReport(String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR");

        Map<UUID, List<AttendanceRecordEntity>> byStudent = attendanceRepo.findAll().stream()
                .collect(Collectors.groupingBy(AttendanceRecordEntity::getStudentId));

        List<AttendanceReportEntry> report = new ArrayList<>();
        for (var entry : byStudent.entrySet()) {
            StudentProfileEntity student = studentRepo.findById(entry.getKey()).orElse(null);
            if (student == null) continue;
            UserEntity studentUser = userRepo.findById(student.getUserId()).orElse(null);
            SchoolClassEntity studentClass = classRepo.findById(student.getClassId()).orElse(null);

            List<AttendanceRecordEntity> records = entry.getValue();
            int total = records.size();
            int present = (int) records.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
            int absent = (int) records.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
            int late = (int) records.stream().filter(r -> "LATE".equals(r.getStatus())).count();
            int excused = (int) records.stream().filter(r -> "EXCUSED".equals(r.getStatus())).count();
            double pct = total > 0 ? Math.round((present + late) * 1000.0 / total) / 10.0 : 0;

            report.add(new AttendanceReportEntry(
                    studentUser != null ? studentUser.getFirstName() + " " + studentUser.getLastName() : "?",
                    studentClass != null ? studentClass.getName() : "?",
                    total, present, absent, late, excused, pct
            ));
        }
        return report;
    }

    public List<GradeReportEntry> getGradesReport(String authorizationHeader) {
        UserEntity actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR");

        record Key(UUID studentId, UUID subjectId) {}
        Map<Key, List<GradeRecordEntity>> grouped = gradeRepo.findAll().stream()
                .collect(Collectors.groupingBy(g -> new Key(g.getStudentId(), g.getSubjectId())));

        List<GradeReportEntry> report = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            StudentProfileEntity student = studentRepo.findById(entry.getKey().studentId()).orElse(null);
            if (student == null) continue;
            UserEntity studentUser = userRepo.findById(student.getUserId()).orElse(null);
            SchoolClassEntity studentClass = classRepo.findById(student.getClassId()).orElse(null);
            SubjectEntity subject = subjectRepo.findById(entry.getKey().subjectId()).orElse(null);

            List<GradeRecordEntity> gradeList = entry.getValue();
            double totalWeighted = 0;
            int totalWeight = 0;
            for (var g : gradeList) {
                totalWeighted += g.getDecimalValue().doubleValue() * g.getWeight();
                totalWeight += g.getWeight();
            }
            double avg = totalWeight > 0 ? Math.round(totalWeighted / totalWeight * 100.0) / 100.0 : 0;

            report.add(new GradeReportEntry(
                    studentUser != null ? studentUser.getFirstName() + " " + studentUser.getLastName() : "?",
                    studentClass != null ? studentClass.getName() : "?",
                    subject != null ? subject.getName() : "?",
                    avg, gradeList.size()
            ));
        }
        return report;
    }

    public BootstrapResponse bootstrap() {
        return new BootstrapResponse(
                new SchoolDomain.DashboardSummary(
                        (int)userRepo.count(), (int)teacherRepo.count(), (int)studentRepo.count(), (int)classRepo.count(),
                        0, 0, (int)gradeRepo.count(), (int)attendanceRepo.count()
                ),
                roleRepo.findAll().stream().map(this::map).toList(),
                userRepo.findAll().stream().map(this::map).toList(),
                teacherRepo.findAll().stream().map(this::map).toList(),
                studentRepo.findAll().stream().map(this::map).toList(),
                parentRepo.findAll().stream().map(this::map).toList(),
                secretaryRepo.findAll().stream().map(this::map).toList(),
                principalRepo.findAll().stream().map(this::map).toList(),
                classRepo.findAll().stream().map(this::map).toList(),
                subjectRepo.findAll().stream().map(this::map).toList(),
                lessonRepo.findAll().stream().map(this::map).toList(),
                sessionRepo.findAll().stream().map(this::map).toList(),
                attendanceRepo.findAll().stream().map(this::map).toList(),
                gradeRepo.findAll().stream().map(this::map).toList(),
                messageRepo.findAll().stream().map(this::map).toList(),
                notificationRepo.findAll().stream().map(this::map).toList(),
                materialRepo.findAll().stream().map(this::map).toList()
        );
    }

    public List<SchoolDomain.User> users() {
        return userRepo.findAll().stream().map(this::map).toList();
    }
}
