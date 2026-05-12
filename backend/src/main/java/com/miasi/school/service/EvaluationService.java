package com.miasi.school.service;

import com.miasi.school.dto.*;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.model.SchoolDomain;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EvaluationService {

    private final GradeRecordRepository gradeRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final AuthService authService;

    public EvaluationService(GradeRecordRepository gradeRepo,
                             AttendanceRecordRepository attendanceRepo,
                             AuthService authService) {
        this.gradeRepo = gradeRepo;
        this.attendanceRepo = attendanceRepo;
        this.authService = authService;
    }

    @Transactional
    public SchoolDomain.GradeRecord createGrade(CreateGradeRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER");

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
        gradeRepo.deleteById(id);
    }

    @Transactional
    public SchoolDomain.AttendanceRecord createAttendance(CreateAttendanceRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        authService.requireRole(actor, "ADMIN", "TEACHER", "SECRETARY");

        AttendanceRecordEntity record = new AttendanceRecordEntity(
                UUID.randomUUID(), request.sessionId(), request.studentId(), request.status(), request.excuseComment()
        );
        return map(attendanceRepo.save(record));
    }

    @Transactional
    public SchoolDomain.AttendanceRecord excuseAttendance(UUID id, ExcuseAttendanceRequest request, String authHeader) {
        UserEntity actor = authService.requireAuthorizedUser(authHeader);
        // Authorization logic for excusing attendance
        AttendanceRecordEntity record = attendanceRepo.findById(id).orElseThrow();
        record.setStatus("EXCUSED");
        record.setExcuseComment(request.excuseComment());
        return map(attendanceRepo.save(record));
    }

    // -- Mappers --
    public SchoolDomain.AttendanceRecord map(AttendanceRecordEntity e) {
        return new SchoolDomain.AttendanceRecord(e.getId(), e.getSessionId(), e.getStudentId(), SchoolDomain.AttendanceStatus.valueOf(e.getStatus()), e.getExcuseComment());
    }
    public SchoolDomain.GradeRecord map(GradeRecordEntity e) {
        return new SchoolDomain.GradeRecord(e.getId(), e.getStudentId(), e.getTeacherId(), e.getSubjectId(), e.getDecimalValue(), e.getWeight(), e.getType(), e.getComment(), e.getIssuedAt(), e.getCategory());
    }
}
