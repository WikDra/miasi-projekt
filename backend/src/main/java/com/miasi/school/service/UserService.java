package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final TeacherProfileRepository teacherRepo;
    private final StudentProfileRepository studentRepo;
    private final ParentProfileRepository parentRepo;
    private final SecretaryProfileRepository secretaryRepo;
    private final PrincipalProfileRepository principalRepo;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo,
                       TeacherProfileRepository teacherRepo,
                       StudentProfileRepository studentRepo,
                       ParentProfileRepository parentRepo,
                       SecretaryProfileRepository secretaryRepo,
                       PrincipalProfileRepository principalRepo,
                       AuthService authService,
                       PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
        this.parentRepo = parentRepo;
        this.secretaryRepo = secretaryRepo;
        this.principalRepo = principalRepo;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SchoolDomain.User createUser(CreateUserRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN");

        if (userRepo.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new IllegalArgumentException("Użytkownik z tym adresem email już istnieje");
        }

        UserEntity user = new UserEntity(
                UUID.randomUUID(), request.firstName(), request.lastName(), request.email(),
                passwordEncoder.encode(request.password()), "ACTIVE", request.roles()
        );
        return map(userRepo.save(user));
    }

    @Transactional
    public SchoolDomain.User updateUser(UUID userId, UpdateUserRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN");

        UserEntity user = userRepo.findById(userId).orElseThrow();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setStatus(request.status());
        user.setRoles(request.roles());

        return map(userRepo.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN");
        userRepo.deleteById(userId);
    }

    @Transactional
    public SchoolDomain.StudentProfile createStudent(CreateStudentRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        StudentProfileEntity student = new StudentProfileEntity(
                UUID.randomUUID(), request.userId(), request.parentId(), request.classId(), request.studentNumber()
        );
        return map(studentRepo.save(student));
    }

    @Transactional
    public SchoolDomain.StudentProfile updateStudent(UUID id, UpdateStudentRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        StudentProfileEntity student = studentRepo.findById(id).orElseThrow();
        student.setParentId(request.parentId());
        student.setClassId(request.classId());
        student.setStudentNumber(request.studentNumber());
        return map(studentRepo.save(student));
    }

    @Transactional
    public void deleteStudent(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");
        studentRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.StudentProfile suspendStudent(UUID id, String authHeader) {
        return setStudentUserStatus(id, authHeader, "INACTIVE");
    }

    @Transactional
    public SchoolDomain.StudentProfile reactivateStudent(UUID id, String authHeader) {
        return setStudentUserStatus(id, authHeader, "ACTIVE");
    }

    private SchoolDomain.StudentProfile setStudentUserStatus(UUID id, String authHeader, String status) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        StudentProfileEntity student = studentRepo.findById(id).orElseThrow();
        UserEntity user = userRepo.findById(student.getUserId()).orElseThrow();
        if (!user.getRoles().contains("STUDENT")) {
            throw new IllegalArgumentException("Profil ucznia nie jest powiązany z kontem ucznia");
        }
        user.setStatus(status);
        userRepo.save(user);
        return map(student);
    }

    // -- Mappers --
    public SchoolDomain.User map(UserEntity e) {
        return new SchoolDomain.User(e.getId(), e.getFirstName(), e.getLastName(), e.getEmail(), e.getStatus(), e.getRoles());
    }
    public SchoolDomain.TeacherProfile map(TeacherProfileEntity e) {
        return new SchoolDomain.TeacherProfile(e.getId(), e.getUserId(), e.getEmployeeNumber(), e.getSpecialization());
    }
    public SchoolDomain.StudentProfile map(StudentProfileEntity e) {
        return new SchoolDomain.StudentProfile(e.getId(), e.getUserId(), e.getParentId(), e.getClassId(), e.getStudentNumber());
    }
    public SchoolDomain.ParentProfile map(ParentProfileEntity e) {
        return new SchoolDomain.ParentProfile(e.getId(), e.getUserId(), e.getPhoneNumber());
    }
    public SchoolDomain.SecretaryProfile map(SecretaryProfileEntity e) {
        return new SchoolDomain.SecretaryProfile(e.getId(), e.getUserId(), e.getOfficeRoom(), e.getInternalPhone());
    }
    public SchoolDomain.PrincipalProfile map(PrincipalProfileEntity e) {
        return new SchoolDomain.PrincipalProfile(e.getId(), e.getUserId(), e.getTeacherId(), e.getNominationDate());
    }
}
