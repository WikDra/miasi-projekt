package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class EvaluationService {

    private final GradeRecordRepository gradeRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final AuthService authService;
    private final TeacherProfileRepository teacherRepo;
    private final ClassSessionRepository sessionRepo;
    private final LessonRepository lessonRepo;
    private final ParentProfileRepository parentRepo;
    private final StudentProfileRepository studentRepo;

    public EvaluationService(GradeRecordRepository gradeRepo,
                             AttendanceRecordRepository attendanceRepo,
                             AuthService authService,
                             TeacherProfileRepository teacherRepo,
                             ClassSessionRepository sessionRepo,
                             LessonRepository lessonRepo,
                             ParentProfileRepository parentRepo,
                             StudentProfileRepository studentRepo) {
        this.gradeRepo = gradeRepo;
        this.attendanceRepo = attendanceRepo;
        this.authService = authService;
        this.teacherRepo = teacherRepo;
        this.sessionRepo = sessionRepo;
        this.lessonRepo = lessonRepo;
        this.parentRepo = parentRepo;
        this.studentRepo = studentRepo;
    }

    @Transactional
    public SchoolDomain.GradeRecord createGrade(CreateGradeRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER");
        requireTeacherOwnsProfile(actor, request.teacherId());

        GradeRecordEntity grade = new GradeRecordEntity(
                UUID.randomUUID(), request.studentId(), request.teacherId(), request.subjectId(),
                request.decimalValue(), request.weight(), request.type(), request.comment(), LocalDate.now(), "NORMAL"
        );
        return map(gradeRepo.save(grade));
    }

    @Transactional
    public SchoolDomain.GradeRecord updateGrade(UUID id, UpdateGradeRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER");

        GradeRecordEntity grade = gradeRepo.findById(id).orElseThrow();
        requireTeacherOwnsProfile(actor, grade.getTeacherId());
        grade.setDecimalValue(request.decimalValue());
        grade.setWeight(request.weight());
        grade.setType(request.type());
        grade.setComment(request.comment());
        return map(gradeRepo.save(grade));
    }

    @Transactional
    public void deleteGrade(UUID id, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER");
        GradeRecordEntity grade = gradeRepo.findById(id).orElseThrow();
        requireTeacherOwnsProfile(actor, grade.getTeacherId());
        gradeRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.AttendanceRecord createAttendance(CreateAttendanceRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER", "SECRETARY");
        requireTeacherOwnsSession(actor, request.sessionId());

        AttendanceRecordEntity record = new AttendanceRecordEntity(
                UUID.randomUUID(), request.sessionId(), request.studentId(), request.status(), request.excuseComment()
        );
        return map(attendanceRepo.save(record));
    }

    @Transactional
    public SchoolDomain.AttendanceRecord excuseAttendance(UUID id, ExcuseAttendanceRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "SECRETARY", "PARENT");
        AttendanceRecordEntity record = attendanceRepo.findById(id).orElseThrow();
        requireParentOwnsStudent(actor, record.getStudentId());
        record.setStatus("EXCUSED");
        record.setExcuseComment(request.excuseComment());
        return map(attendanceRepo.save(record));
    }

    private void requireTeacherOwnsProfile(UserEntity actor, UUID teacherId) {
        if (!actor.getRoles().contains("TEACHER") || actor.getRoles().contains("ADMIN")) {
            return;
        }

        TeacherProfileEntity teacher = teacherRepo.findByUserId(actor.getId())
                .orElseThrow(() -> new AuthorizationFailedException("Brak profilu nauczyciela"));
        if (!teacher.getId().equals(teacherId)) {
            throw new AuthorizationFailedException("Możesz zarządzać tylko własnymi ocenami");
        }
    }

    private void requireTeacherOwnsSession(UserEntity actor, UUID sessionId) {
        if (!actor.getRoles().contains("TEACHER") || actor.getRoles().contains("ADMIN") || actor.getRoles().contains("SECRETARY")) {
            return;
        }

        TeacherProfileEntity teacher = teacherRepo.findByUserId(actor.getId())
                .orElseThrow(() -> new AuthorizationFailedException("Brak profilu nauczyciela"));
        ClassSessionEntity session = sessionRepo.findById(sessionId).orElseThrow();
        LessonEntity lesson = lessonRepo.findById(session.getLessonId()).orElseThrow();
        if (!teacher.getId().equals(lesson.getTeacherId())) {
            throw new AuthorizationFailedException("Możesz wpisywać frekwencję tylko dla własnych lekcji");
        }
    }

    private void requireParentOwnsStudent(UserEntity actor, UUID studentId) {
        if (!actor.getRoles().contains("PARENT") || actor.getRoles().contains("ADMIN") || actor.getRoles().contains("SECRETARY")) {
            return;
        }

        ParentProfileEntity parent = parentRepo.findByUserId(actor.getId())
                .orElseThrow(() -> new AuthorizationFailedException("Brak profilu rodzica"));
        StudentProfileEntity student = studentRepo.findById(studentId).orElseThrow();
        if (!parent.getId().equals(student.getParentId())) {
            throw new AuthorizationFailedException("Możesz usprawiedliwiać tylko własne dziecko");
        }
    }

    // -- Mappers --
    public SchoolDomain.AttendanceRecord map(AttendanceRecordEntity e) {
        return new SchoolDomain.AttendanceRecord(e.getId(), e.getSessionId(), e.getStudentId(), SchoolDomain.AttendanceStatus.valueOf(e.getStatus()), e.getExcuseComment());
    }
    public SchoolDomain.GradeRecord map(GradeRecordEntity e) {
        return new SchoolDomain.GradeRecord(e.getId(), e.getStudentId(), e.getTeacherId(), e.getSubjectId(), e.getDecimalValue(), e.getWeight(), e.getType(), e.getComment(), e.getIssuedAt(), e.getCategory());
    }
}
