package com.miasi.school.service;

import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

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
    private final RoleRepository roleRepo;
    private final boolean seedDemoData;

    public DataSeeder(PasswordEncoder passwordEncoder,
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
                      RoleRepository roleRepo,
                      @Value("${app.seed-demo-data:true}") boolean seedDemoData) {
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
        this.roleRepo = roleRepo;
        this.seedDemoData = seedDemoData;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            System.out.println("Demo data seeding disabled by app.seed-demo-data=false.");
            return;
        }

        if (userRepo.findByEmailIgnoreCase("admin@school.local").isPresent()) {
            return;
        }

        System.out.println("Seeding local demo data from README.md accounts...");

        // The demo seed only runs when the bundled admin account is missing.
        userRepo.deleteAll();
        teacherRepo.deleteAll();
        studentRepo.deleteAll();
        parentRepo.deleteAll();
        secretaryRepo.deleteAll();
        principalRepo.deleteAll();
        roleRepo.deleteAll();

        // Create Roles
        List.of("ADMIN", "DIRECTOR", "SECRETARY", "TEACHER", "STUDENT", "PARENT")
            .forEach(name -> roleRepo.save(new RoleEntity(UUID.randomUUID(), name)));

        // 1. ADMIN
        userRepo.save(new UserEntity(UUID.randomUUID(), "Admin", "User", "admin@school.local", passwordEncoder.encode("Admin123!"), "ACTIVE", List.of("ADMIN")));

        // 2. DIRECTOR
        UserEntity dirUser = new UserEntity(UUID.randomUUID(), "Marek", "Dyrektorski", "director@school.local", passwordEncoder.encode("Director123!"), "ACTIVE", List.of("DIRECTOR", "TEACHER"));
        userRepo.save(dirUser);
        TeacherProfileEntity dirTeacherProfile = teacherRepo.save(new TeacherProfileEntity(UUID.randomUUID(), dirUser.getId(), "DIR/001", "Zarządzanie"));
        principalRepo.save(new PrincipalProfileEntity(UUID.randomUUID(), dirUser.getId(), dirTeacherProfile.getId(), LocalDate.now()));

        // 3. SECRETARY
        UserEntity secUser = new UserEntity(UUID.randomUUID(), "Beata", "Sekretna", "secretary@school.local", passwordEncoder.encode("Secretary123!"), "ACTIVE", List.of("SECRETARY"));
        userRepo.save(secUser);
        secretaryRepo.save(new SecretaryProfileEntity(UUID.randomUUID(), secUser.getId(), "102", "123"));

        // 4. TEACHER
        UserEntity teacherUser = new UserEntity(UUID.randomUUID(), "Jan", "Kowalski", "teacher@school.local", passwordEncoder.encode("Teacher123!"), "ACTIVE", List.of("TEACHER"));
        userRepo.save(teacherUser);
        TeacherProfileEntity teacherProfile = teacherRepo.save(new TeacherProfileEntity(UUID.randomUUID(), teacherUser.getId(), "EMP/001", "Matematyka"));

        // 5. PARENT
        UserEntity parentUser = new UserEntity(UUID.randomUUID(), "Marek", "Nowak", "parent@school.local", passwordEncoder.encode("Parent123!"), "ACTIVE", List.of("PARENT"));
        userRepo.save(parentUser);
        ParentProfileEntity parentProfile = parentRepo.save(new ParentProfileEntity(UUID.randomUUID(), parentUser.getId(), "555-666-777"));

        // 6. STUDENT
        UserEntity studentUser = new UserEntity(UUID.randomUUID(), "Anna", "Nowak", "student@school.local", passwordEncoder.encode("Student123!"), "ACTIVE", List.of("STUDENT"));
        userRepo.save(studentUser);
        
        // Infrastructure
        SchoolClassEntity class1A = classRepo.save(new SchoolClassEntity(UUID.randomUUID(), teacherProfile.getId(), "1A", "2023/2024"));
        studentRepo.save(new StudentProfileEntity(UUID.randomUUID(), studentUser.getId(), parentProfile.getId(), class1A.getId(), "S/2023/001"));

        SubjectEntity math = subjectRepo.save(new SubjectEntity(UUID.randomUUID(), "Matematyka", "Królowa nauk"));
        
        LessonEntity lesson = lessonRepo.save(new LessonEntity(
                UUID.randomUUID(), class1A.getId(), teacherProfile.getId(), math.getId(),
                DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(8, 45), "204"
        ));

        sessionRepo.save(new ClassSessionEntity(UUID.randomUUID(), lesson.getId(), LocalDate.now(), "Wprowadzenie", "SCHEDULED"));

        System.out.println("Demo data seed complete.");
    }
}
