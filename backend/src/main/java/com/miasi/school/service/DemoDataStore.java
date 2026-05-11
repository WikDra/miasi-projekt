package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.exception.AuthenticationFailedException;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.model.SchoolDomain;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DemoDataStore {

    private final Map<UUID, SchoolDomain.Role> roles = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.User> users = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.TeacherProfile> teachers = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.StudentProfile> students = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.ParentProfile> parents = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.SecretaryProfile> secretaries = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.PrincipalProfile> principals = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.SchoolClass> classes = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.Subject> subjects = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.Lesson> lessons = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.ClassSession> classSessions = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.AttendanceRecord> attendance = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.GradeRecord> grades = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.Message> messages = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.Notification> notifications = new LinkedHashMap<>();
    private final Map<UUID, SchoolDomain.TeachingMaterial> teachingMaterials = new LinkedHashMap<>();
    private final SchoolStateStore stateStore;
    private final PasswordEncoder passwordEncoder;

    public DemoDataStore(PasswordEncoder passwordEncoder) {
        this(passwordEncoder, new InMemorySchoolStateStore());
    }

    @Autowired
    public DemoDataStore(PasswordEncoder passwordEncoder, SchoolStateStore stateStore) {
        this.passwordEncoder = passwordEncoder;
        this.stateStore = stateStore;
        initializeState();
    }

    // ── Authentication ──

    public LoginResponse authenticate(LoginRequest request) {
        SchoolDomain.User user = users.values().stream()
                .filter(candidate -> candidate.email().equalsIgnoreCase(request.email()))
                .findFirst()
                .orElseThrow(() -> new AuthenticationFailedException("Nieprawidłowy email lub hasło"));

        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new AuthenticationFailedException("Nieprawidłowy email lub hasło");
        }

        return new LoginResponse(user.id(), user.fullName(), user.email(), user.roles(), "demo-token-" + user.id());
    }

    // ── Grades ──

    public synchronized SchoolDomain.GradeRecord createGrade(CreateGradeRequest request) {
        return createGrade(request, null);
    }

    public synchronized SchoolDomain.GradeRecord createGrade(CreateGradeRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        SchoolDomain.StudentProfile student = requireStudent(request.studentId());
        SchoolDomain.TeacherProfile teacher = requireGraderTeacher(actor, request.teacherId());
        SchoolDomain.Subject subject = requireSubject(request.subjectId());

        SchoolDomain.GradeRecord grade = new SchoolDomain.GradeRecord(
                UUID.randomUUID(), student.id(), teacher.id(), subject.id(),
                request.decimalValue(), request.weight(),
                request.type().trim().toUpperCase(),
                request.comment() == null ? "" : request.comment().trim(),
                LocalDate.now(), "CURRENT"
        );
        grades.put(grade.id(), grade);

        addNotification(student.userId(), "GRADE",
                "Dodano nową ocenę: " + grade.decimalValue() + " z " + subject.name());
        persistState();
        return grade;
    }

    // ── Attendance ──

    public synchronized SchoolDomain.AttendanceRecord createAttendance(CreateAttendanceRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "TEACHER", "ADMIN", "DIRECTOR");

        if (classSessions.get(request.sessionId()) == null) {
            throw new NoSuchElementException("Nie znaleziono sesji lekcyjnej");
        }
        requireStudent(request.studentId());

        SchoolDomain.AttendanceRecord record = new SchoolDomain.AttendanceRecord(
                UUID.randomUUID(), request.sessionId(), request.studentId(),
            SchoolDomain.AttendanceStatus.valueOf(request.status().trim().toUpperCase()),
                request.excuseComment()
        );
        attendance.put(record.id(), record);

        SchoolDomain.StudentProfile student = students.get(request.studentId());
        if (student != null) {
            addNotification(student.userId(), "ATTENDANCE",
                    "Zarejestrowano frekwencję: " + record.status());
        }
        persistState();
        return record;
    }

    // ── Messages ──

    public synchronized SchoolDomain.Message createMessage(CreateMessageRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);

        if (users.get(request.recipientId()) == null) {
            throw new NoSuchElementException("Nie znaleziono odbiorcy");
        }

        SchoolDomain.Message message = new SchoolDomain.Message(
                UUID.randomUUID(), actor.id(), request.recipientId(),
                request.title().trim(), request.content().trim(),
                LocalDateTime.now()
        );
        messages.put(message.id(), message);

        addNotification(request.recipientId(), "MESSAGE",
                "Nowa wiadomość: " + message.title());
        persistState();
        return message;
    }

    // ── Notifications ──

    public synchronized SchoolDomain.Notification markNotificationAsRead(UUID notificationId, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        SchoolDomain.Notification existing = notifications.get(notificationId);
        if (existing == null) {
            throw new NoSuchElementException("Nie znaleziono powiadomienia");
        }
        if (!existing.userId().equals(actor.id())) {
            throw new AuthorizationFailedException("Brak dostępu do tego powiadomienia");
        }

        SchoolDomain.Notification updated = new SchoolDomain.Notification(
                existing.id(), existing.userId(), existing.type(),
                existing.content(), true, existing.createdAt()
        );
        notifications.put(updated.id(), updated);
        persistState();
        return updated;
    }

    // ── Users CRUD ──

    public synchronized SchoolDomain.User createUser(CreateUserRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN");

        boolean emailExists = users.values().stream()
                .anyMatch(u -> u.email().equalsIgnoreCase(request.email()));
        if (emailExists) {
            throw new IllegalArgumentException("Użytkownik z tym adresem email już istnieje");
        }

        SchoolDomain.User user = new SchoolDomain.User(
                UUID.randomUUID(), request.firstName().trim(), request.lastName().trim(),
                request.email().trim(), passwordEncoder.encode(request.password()),
                "ACTIVE", List.copyOf(request.roles())
        );
        users.put(user.id(), user);
        persistState();
        return user;
    }

    public synchronized SchoolDomain.User updateUser(UUID userId, UpdateUserRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN");

        SchoolDomain.User existing = users.get(userId);
        if (existing == null) {
            throw new NoSuchElementException("Nie znaleziono użytkownika");
        }

        SchoolDomain.User updated = new SchoolDomain.User(
                existing.id(), request.firstName().trim(), request.lastName().trim(),
                request.email().trim(), existing.passwordHash(),
                request.status().trim().toUpperCase(),
                request.roles() != null ? List.copyOf(request.roles()) : existing.roles()
        );
        users.put(updated.id(), updated);
        persistState();
        return updated;
    }

    // ── Students CRUD ──

    public synchronized SchoolDomain.StudentProfile createStudent(CreateStudentRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        if (users.get(request.userId()) == null) {
            throw new NoSuchElementException("Nie znaleziono użytkownika");
        }
        if (classes.get(request.classId()) == null) {
            throw new NoSuchElementException("Nie znaleziono klasy");
        }

        SchoolDomain.StudentProfile student = new SchoolDomain.StudentProfile(
                UUID.randomUUID(), request.userId(), request.parentId(),
                request.classId(), request.studentNumber().trim()
        );
        students.put(student.id(), student);
        persistState();
        return student;
    }

    // ── Classes CRUD ──

    public synchronized SchoolDomain.SchoolClass createClass(CreateClassRequest request, String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "SECRETARY", "ADMIN");

        SchoolDomain.SchoolClass schoolClass = new SchoolDomain.SchoolClass(
                UUID.randomUUID(), request.teacherId(),
                request.name().trim(), request.schoolYear().trim()
        );
        classes.put(schoolClass.id(), schoolClass);
        persistState();
        return schoolClass;
    }

    // ── Reports ──

    public List<AttendanceReportEntry> getAttendanceReport(String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR");

        Map<UUID, List<SchoolDomain.AttendanceRecord>> byStudent = attendance.values().stream()
                .collect(Collectors.groupingBy(SchoolDomain.AttendanceRecord::studentId));

        List<AttendanceReportEntry> report = new ArrayList<>();
        for (var entry : byStudent.entrySet()) {
            SchoolDomain.StudentProfile student = students.get(entry.getKey());
            if (student == null) continue;
            SchoolDomain.User studentUser = users.get(student.userId());
            SchoolDomain.SchoolClass studentClass = classes.get(student.classId());

            List<SchoolDomain.AttendanceRecord> records = entry.getValue();
            int total = records.size();
            int present = (int) records.stream().filter(r -> SchoolDomain.AttendanceStatus.PRESENT.equals(r.status())).count();
            int absent = (int) records.stream().filter(r -> SchoolDomain.AttendanceStatus.ABSENT.equals(r.status())).count();
            int late = (int) records.stream().filter(r -> SchoolDomain.AttendanceStatus.LATE.equals(r.status())).count();
            int excused = (int) records.stream().filter(r -> SchoolDomain.AttendanceStatus.EXCUSED.equals(r.status())).count();
            double pct = total > 0 ? Math.round((present + late) * 1000.0 / total) / 10.0 : 0;

            report.add(new AttendanceReportEntry(
                    studentUser != null ? studentUser.fullName() : "?",
                    studentClass != null ? studentClass.name() : "?",
                    total, present, absent, late, excused, pct
            ));
        }
        return report;
    }

    public List<GradeReportEntry> getGradesReport(String authorizationHeader) {
        SchoolDomain.User actor = requireAuthorizedUser(authorizationHeader);
        requireRole(actor, "ADMIN", "DIRECTOR");

        record Key(UUID studentId, UUID subjectId) {}

        Map<Key, List<SchoolDomain.GradeRecord>> grouped = grades.values().stream()
                .collect(Collectors.groupingBy(g -> new Key(g.studentId(), g.subjectId())));

        List<GradeReportEntry> report = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            SchoolDomain.StudentProfile student = students.get(entry.getKey().studentId());
            if (student == null) continue;
            SchoolDomain.User studentUser = users.get(student.userId());
            SchoolDomain.SchoolClass studentClass = classes.get(student.classId());
            SchoolDomain.Subject subject = subjects.get(entry.getKey().subjectId());

            List<SchoolDomain.GradeRecord> gradeList = entry.getValue();
            double totalWeighted = 0;
            int totalWeight = 0;
            for (var g : gradeList) {
                totalWeighted += g.decimalValue().doubleValue() * g.weight();
                totalWeight += g.weight();
            }
            double avg = totalWeight > 0 ? Math.round(totalWeighted / totalWeight * 100.0) / 100.0 : 0;

            report.add(new GradeReportEntry(
                    studentUser != null ? studentUser.fullName() : "?",
                    studentClass != null ? studentClass.name() : "?",
                    subject != null ? subject.name() : "?",
                    avg, gradeList.size()
            ));
        }
        return report;
    }

    // ── Bootstrap / state ──

    public synchronized BootstrapResponse bootstrap() {
        return snapshot();
    }

    public List<SchoolDomain.User> users() {
        return List.copyOf(users.values());
    }

    // ── Private helpers ──

    private void addNotification(UUID userId, String type, String content) {
        SchoolDomain.Notification notification = new SchoolDomain.Notification(
                UUID.randomUUID(), userId, type, content, false, LocalDateTime.now()
        );
        notifications.put(notification.id(), notification);
    }

    private void persistState() {
        stateStore.save(snapshot());
    }

    private void requireRole(SchoolDomain.User actor, String... allowedRoles) {
        for (String allowed : allowedRoles) {
            if (actor.roles().contains(allowed)) return;
        }
        throw new AuthorizationFailedException("Brak uprawnień do wykonania tej operacji");
    }

    private SchoolDomain.StudentProfile requireStudent(UUID studentId) {
        SchoolDomain.StudentProfile student = students.get(studentId);
        if (student == null) {
            throw new NoSuchElementException("Nie znaleziono ucznia");
        }
        return student;
    }

    private SchoolDomain.TeacherProfile requireTeacher(UUID teacherId) {
        SchoolDomain.TeacherProfile teacher = teachers.get(teacherId);
        if (teacher == null) {
            throw new NoSuchElementException("Nie znaleziono nauczyciela");
        }
        return teacher;
    }

    private SchoolDomain.Subject requireSubject(UUID subjectId) {
        SchoolDomain.Subject subject = subjects.get(subjectId);
        if (subject == null) {
            throw new NoSuchElementException("Nie znaleziono przedmiotu");
        }
        return subject;
    }

    private SchoolDomain.User requireAuthorizedUser(String authorizationHeader) {
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

        SchoolDomain.User user = users.get(userId);
        if (user == null) {
            throw new AuthenticationFailedException("Nieprawidłowy token");
        }
        return user;
    }

    private SchoolDomain.TeacherProfile requireGraderTeacher(SchoolDomain.User actor, UUID requestedTeacherId) {
        if (actor.roles().contains("ADMIN") || actor.roles().contains("DIRECTOR")) {
            return requireTeacher(requestedTeacherId);
        }

        if (!actor.roles().contains("TEACHER")) {
            throw new AuthorizationFailedException("Tylko nauczyciel może wystawiać oceny");
        }

        SchoolDomain.TeacherProfile actorTeacher = teachers.values().stream()
                .filter(teacher -> teacher.userId().equals(actor.id()))
                .findFirst()
                .orElseThrow(() -> new AuthorizationFailedException("Zalogowany nauczyciel nie ma przypisanego profilu"));

        if (!actorTeacher.id().equals(requestedTeacherId)) {
            throw new AuthorizationFailedException("Nauczyciel może wystawiać oceny tylko ze swojego konta");
        }

        return actorTeacher;
    }

    private static String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new AuthenticationFailedException("Brak autoryzacji");
        }

        String token = authorizationHeader.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        return token;
    }

    // ── State management ──

    private void initializeState() {
        Optional<BootstrapResponse> loadedState = stateStore.load();
        if (loadedState.isPresent()) {
            applyState(loadedState.get());
            return;
        }

        BootstrapResponse seededState = seedState();
        applyState(seededState);
        stateStore.save(seededState);
    }

    private void applyState(BootstrapResponse state) {
        replaceState(roles, safeList(state.roles()), SchoolDomain.Role::id);
        replaceState(users, safeList(state.users()), SchoolDomain.User::id);
        replaceState(teachers, safeList(state.teachers()), SchoolDomain.TeacherProfile::id);
        replaceState(students, safeList(state.students()), SchoolDomain.StudentProfile::id);
        replaceState(parents, safeList(state.parents()), SchoolDomain.ParentProfile::id);
        replaceState(secretaries, safeList(state.secretaries()), SchoolDomain.SecretaryProfile::id);
        replaceState(principals, safeList(state.principals()), SchoolDomain.PrincipalProfile::id);
        replaceState(classes, safeList(state.classes()), SchoolDomain.SchoolClass::id);
        replaceState(subjects, safeList(state.subjects()), SchoolDomain.Subject::id);
        replaceState(lessons, safeList(state.lessons()), SchoolDomain.Lesson::id);
        replaceState(classSessions, safeList(state.classSessions()), SchoolDomain.ClassSession::id);
        replaceState(attendance, safeList(state.attendance()), SchoolDomain.AttendanceRecord::id);
        replaceState(grades, safeList(state.grades()), SchoolDomain.GradeRecord::id);
        replaceState(messages, safeList(state.messages()), SchoolDomain.Message::id);
        replaceState(notifications, safeList(state.notifications()), SchoolDomain.Notification::id);
        replaceState(teachingMaterials, safeList(state.teachingMaterials()), SchoolDomain.TeachingMaterial::id);
    }

    private BootstrapResponse snapshot() {
        return new BootstrapResponse(
                summary(),
                List.copyOf(roles.values()),
                List.copyOf(users.values()),
                List.copyOf(teachers.values()),
                List.copyOf(students.values()),
                List.copyOf(parents.values()),
                List.copyOf(secretaries.values()),
                List.copyOf(principals.values()),
                List.copyOf(classes.values()),
                List.copyOf(subjects.values()),
                List.copyOf(lessons.values()),
                List.copyOf(classSessions.values()),
                List.copyOf(attendance.values()),
                List.copyOf(grades.values()),
                List.copyOf(messages.values()),
                List.copyOf(notifications.values()),
                List.copyOf(teachingMaterials.values())
        );
    }

    private BootstrapResponse seedState() {
        seed();
        return snapshot();
    }

    private SchoolDomain.DashboardSummary summary() {
        long unreadMessages = messages.values().stream()
                .collect(Collectors.groupingBy(SchoolDomain.Message::recipientId, Collectors.counting()))
                .values().stream().mapToLong(Long::longValue).sum();
        long unreadNotifications = notifications.values().stream().filter(notification -> !notification.read()).count();
        return new SchoolDomain.DashboardSummary(
                users.size(), teachers.size(), students.size(), classes.size(),
                (int) unreadMessages, (int) unreadNotifications,
                grades.size(), attendance.size()
        );
    }

    private void seed() {
        clearState();

        SchoolDomain.Role adminRole = addRole("ADMIN");
        SchoolDomain.Role directorRole = addRole("DIRECTOR");
        SchoolDomain.Role secretaryRole = addRole("SECRETARY");
        SchoolDomain.Role teacherRole = addRole("TEACHER");
        SchoolDomain.Role studentRole = addRole("STUDENT");
        SchoolDomain.Role parentRole = addRole("PARENT");

        SchoolDomain.User admin = addUser("Alicja", "Admin", "admin@school.local", "Admin123!", "ACTIVE", adminRole);
        SchoolDomain.User director = addUser("Marta", "Dyrektor", "director@school.local", "Director123!", "ACTIVE", directorRole);
        SchoolDomain.User secretary = addUser("Ewa", "Sekretariat", "secretary@school.local", "Secretary123!", "ACTIVE", secretaryRole);
        SchoolDomain.User teacher = addUser("Jan", "Kowalski", "teacher@school.local", "Teacher123!", "ACTIVE", teacherRole);
        SchoolDomain.User student = addUser("Ola", "Nowak", "student@school.local", "Student123!", "ACTIVE", studentRole);
        SchoolDomain.User parent = addUser("Piotr", "Nowak", "parent@school.local", "Parent123!", "ACTIVE", parentRole);

        SchoolDomain.TeacherProfile teacherProfile = new SchoolDomain.TeacherProfile(id("teacher-profile"), teacher.id(), "EMP-2026-01", "Matematyka i informatyka");
        SchoolDomain.SchoolClass class1A = new SchoolDomain.SchoolClass(id("class-1a"), teacher.id(), "1A", "2025/2026");
        SchoolDomain.StudentProfile studentProfile = new SchoolDomain.StudentProfile(id("student-profile"), student.id(), parent.id(), class1A.id(), "STU-1001");
        SchoolDomain.ParentProfile parentProfile = new SchoolDomain.ParentProfile(id("parent-profile"), parent.id(), "+48 600 200 300");
        SchoolDomain.SecretaryProfile secretaryProfile = new SchoolDomain.SecretaryProfile(id("secretary-profile"), secretary.id(), "12", "+48 41 000 00 12");
        SchoolDomain.PrincipalProfile principalProfile = new SchoolDomain.PrincipalProfile(id("principal-profile"), director.id(), teacher.id(), LocalDate.of(2026, 4, 1));

        SchoolDomain.Subject math = new SchoolDomain.Subject(id("subject-math"), "Matematyka", "Zajęcia z algebry i geometrii");
        SchoolDomain.Subject informatics = new SchoolDomain.Subject(id("subject-it"), "Informatyka", "Podstawy programowania i systemów");

        SchoolDomain.Lesson mathLesson = new SchoolDomain.Lesson(id("lesson-math"), class1A.id(), teacher.id(), math.id(), DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(8, 45), "Sala 12");
        SchoolDomain.Lesson itLesson = new SchoolDomain.Lesson(id("lesson-it"), class1A.id(), teacher.id(), informatics.id(), DayOfWeek.WEDNESDAY, LocalTime.of(10, 0), LocalTime.of(10, 45), "Sala 21");

        SchoolDomain.ClassSession session = new SchoolDomain.ClassSession(id("session-1"), mathLesson.id(), LocalDate.now().plusDays(1), "Powtórka z równań", "PLANNED");
        SchoolDomain.AttendanceRecord attendanceRecord = new SchoolDomain.AttendanceRecord(id("attendance-1"), session.id(), studentProfile.id(), SchoolDomain.AttendanceStatus.PRESENT, null);
        SchoolDomain.GradeRecord grade = new SchoolDomain.GradeRecord(id("grade-1"), studentProfile.id(), teacherProfile.id(), math.id(), new BigDecimal("5.0"), 1, "SPRAWDZIAN", "Bardzo dobra praca", LocalDate.now().minusDays(1), "CURRENT");

        SchoolDomain.Message message = new SchoolDomain.Message(id("message-1"), teacher.id(), parent.id(), "Uwagi po lekcji", "Ola dobrze radzi sobie z materiałem, warto poćwiczyć zadania domowe.", LocalDateTime.now().minusHours(2));
        SchoolDomain.Notification notification = new SchoolDomain.Notification(id("notification-1"), student.id(), "GRADE", "Dodano nową ocenę z matematyki", false, LocalDateTime.now().minusHours(1));
        SchoolDomain.TeachingMaterial teachingMaterial = new SchoolDomain.TeachingMaterial(id("material-1"), teacher.id(), class1A.id(), "Równania liniowe", "/materials/rownania-liniowe.pdf", LocalDateTime.now().minusDays(2));

        principals.put(principalProfile.id(), principalProfile);
        teachers.put(teacherProfile.id(), teacherProfile);
        parents.put(parentProfile.id(), parentProfile);
        secretaries.put(secretaryProfile.id(), secretaryProfile);
        students.put(studentProfile.id(), studentProfile);
        classes.put(class1A.id(), class1A);
        subjects.put(math.id(), math);
        subjects.put(informatics.id(), informatics);
        lessons.put(mathLesson.id(), mathLesson);
        lessons.put(itLesson.id(), itLesson);
        classSessions.put(session.id(), session);
        attendance.put(attendanceRecord.id(), attendanceRecord);
        grades.put(grade.id(), grade);
        messages.put(message.id(), message);
        notifications.put(notification.id(), notification);
        teachingMaterials.put(teachingMaterial.id(), teachingMaterial);
    }

    private void clearState() {
        roles.clear(); users.clear(); teachers.clear(); students.clear();
        parents.clear(); secretaries.clear(); principals.clear(); classes.clear();
        subjects.clear(); lessons.clear(); classSessions.clear(); attendance.clear();
        grades.clear(); messages.clear(); notifications.clear(); teachingMaterials.clear();
    }

    private static <T> void replaceState(Map<UUID, T> target, List<T> entries, Function<T, UUID> idExtractor) {
        target.clear();
        for (T entry : entries) {
            target.put(idExtractor.apply(entry), entry);
        }
    }

    private static <T> List<T> safeList(List<T> entries) {
        return entries == null ? List.of() : entries;
    }

    private SchoolDomain.Role addRole(String name) {
        SchoolDomain.Role role = new SchoolDomain.Role(id("role-" + name.toLowerCase()), name);
        roles.put(role.id(), role);
        return role;
    }

    private SchoolDomain.User addUser(String firstName, String lastName, String email, String password, String status,
                                      SchoolDomain.Role... assignedRoles) {
        List<String> roleNames = List.of(assignedRoles).stream().map(SchoolDomain.Role::name).toList();
        SchoolDomain.User user = new SchoolDomain.User(id("user-" + email), firstName, lastName, email,
                passwordEncoder.encode(password), status, roleNames);
        users.put(user.id(), user);
        return user;
    }

    private static UUID id(String seed) {
        return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8));
    }

    private static final class InMemorySchoolStateStore implements SchoolStateStore {
        private BootstrapResponse state;

        @Override
        public Optional<BootstrapResponse> load() {
            return Optional.ofNullable(state);
        }

        @Override
        public void save(BootstrapResponse state) {
            this.state = state;
        }
    }
}