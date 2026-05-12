package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class AcademicService {

    private final SchoolClassRepository classRepo;
    private final SubjectRepository subjectRepo;
    private final LessonRepository lessonRepo;
    private final ClassSessionRepository sessionRepo;
    private final TeacherProfileRepository teacherRepo;
    private final AuthService authService;

    public AcademicService(SchoolClassRepository classRepo,
                           SubjectRepository subjectRepo,
                           LessonRepository lessonRepo,
                           ClassSessionRepository sessionRepo,
                           TeacherProfileRepository teacherRepo,
                           AuthService authService) {
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.lessonRepo = lessonRepo;
        this.sessionRepo = sessionRepo;
        this.teacherRepo = teacherRepo;
        this.authService = authService;
    }

    @Transactional
    public SchoolDomain.SchoolClass createClass(CreateClassRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        SchoolClassEntity schoolClass = new SchoolClassEntity(
                UUID.randomUUID(), request.teacherId(), request.name(), request.schoolYear()
        );
        return map(classRepo.save(schoolClass));
    }

    @Transactional
    public SchoolDomain.SchoolClass updateClass(UUID id, UpdateClassRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        SchoolClassEntity schoolClass = classRepo.findById(id).orElseThrow();
        schoolClass.setName(request.name());
        schoolClass.setTeacherId(request.teacherId());
        schoolClass.setSchoolYear(request.schoolYear());
        return map(classRepo.save(schoolClass));
    }

    @Transactional
    public void deleteClass(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");
        classRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.Subject createSubject(CreateSubjectRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        SubjectEntity subject = new SubjectEntity(UUID.randomUUID(), request.name(), request.description());
        return map(subjectRepo.save(subject));
    }

    @Transactional
    public SchoolDomain.Subject updateSubject(UUID id, UpdateSubjectRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");

        SubjectEntity subject = subjectRepo.findById(id).orElseThrow();
        subject.setName(request.name());
        subject.setDescription(request.description());
        return map(subjectRepo.save(subject));
    }

    @Transactional
    public void deleteSubject(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY");
        subjectRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.Lesson createLesson(CreateLessonRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY", "TEACHER");

        LessonEntity lesson = new LessonEntity(
                UUID.randomUUID(), request.classId(), request.teacherId(), request.subjectId(),
                request.dayOfWeek(), request.startTime(), request.endTime(), request.roomNumber()
        );
        return map(lessonRepo.save(lesson));
    }

    @Transactional
    public SchoolDomain.Lesson updateLesson(UUID id, UpdateLessonRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY", "TEACHER");

        LessonEntity lesson = lessonRepo.findById(id).orElseThrow();
        lesson.setClassId(request.classId());
        lesson.setTeacherId(request.teacherId());
        lesson.setSubjectId(request.subjectId());
        lesson.setDayOfWeek(request.dayOfWeek());
        lesson.setStartTime(request.startTime());
        lesson.setEndTime(request.endTime());
        lesson.setRoomNumber(request.roomNumber());
        return map(lessonRepo.save(lesson));
    }

    @Transactional
    public void deleteLesson(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY", "TEACHER");
        lessonRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.ClassSession createSession(CreateSessionRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        LessonEntity lesson = lessonRepo.findById(request.lessonId()).orElseThrow(() -> new NoSuchElementException("Nie znaleziono lekcji"));
        
        // Authorization check for session manager
        if (!actor.getRoles().contains("ADMIN") && !actor.getRoles().contains("DIRECTOR") && !actor.getRoles().contains("SECRETARY")) {
            TeacherProfileEntity actorTeacher = teacherRepo.findByUserId(actor.getId()).orElseThrow(() -> new AuthorizationFailedException("Brak profilu nauczyciela"));
            if (!actorTeacher.getId().equals(lesson.getTeacherId())) {
                throw new AuthorizationFailedException("Możesz zarządzać tylko własnymi lekcjami");
            }
        }

        ClassSessionEntity session = new ClassSessionEntity(
                UUID.randomUUID(), lesson.getId(), request.sessionDate(), request.topic().trim(), "SCHEDULED"
        );
        return map(sessionRepo.save(session));
    }

    // -- Mappers --
    public SchoolDomain.SchoolClass map(SchoolClassEntity e) {
        return new SchoolDomain.SchoolClass(e.getId(), e.getTeacherId(), e.getName(), e.getSchoolYear());
    }
    public SchoolDomain.Subject map(SubjectEntity e) {
        return new SchoolDomain.Subject(e.getId(), e.getName(), e.getDescription());
    }
    public SchoolDomain.Lesson map(LessonEntity e) {
        return new SchoolDomain.Lesson(e.getId(), e.getClassId(), e.getTeacherId(), e.getSubjectId(), e.getDayOfWeek(), e.getStartTime(), e.getEndTime(), e.getRoomNumber());
    }
    public SchoolDomain.ClassSession map(ClassSessionEntity e) {
        return new SchoolDomain.ClassSession(e.getId(), e.getLessonId(), e.getSessionDate(), e.getTopic(), e.getStatus());
    }
}
