package com.miasi.school.service;

import com.miasi.school.dto.AttendanceReportEntry;
import com.miasi.school.dto.GradeReportEntry;
import com.miasi.school.entity.SchoolEntities.*;
import com.miasi.school.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AttendanceRecordRepository attendanceRepo;
    private final GradeRecordRepository gradeRepo;
    private final StudentProfileRepository studentRepo;
    private final UserRepository userRepo;
    private final SchoolClassRepository classRepo;
    private final SubjectRepository subjectRepo;
    private final AuthService authService;

    public ReportService(AttendanceRecordRepository attendanceRepo,
                         GradeRecordRepository gradeRepo,
                         StudentProfileRepository studentRepo,
                         UserRepository userRepo,
                         SchoolClassRepository classRepo,
                         SubjectRepository subjectRepo,
                         AuthService authService) {
        this.attendanceRepo = attendanceRepo;
        this.gradeRepo = gradeRepo;
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.authService = authService;
    }

    public List<AttendanceReportEntry> getAttendanceReport(String authHeader) {
        authService.requireAuthorizedUser(authHeader);
        
        List<StudentProfileEntity> students = studentRepo.findAll();
        Map<UUID, UserEntity> users = userRepo.findAll().stream().collect(Collectors.toMap(UserEntity::getId, u -> u));
        Map<UUID, SchoolClassEntity> classes = classRepo.findAll().stream().collect(Collectors.toMap(SchoolClassEntity::getId, c -> c));
        List<AttendanceRecordEntity> allAttendance = attendanceRepo.findAll();

        return students.stream().map(student -> {
            UserEntity user = users.get(student.getUserId());
            SchoolClassEntity schoolClass = classes.get(student.getClassId());
            List<AttendanceRecordEntity> studentAttendance = allAttendance.stream()
                    .filter(a -> a.getStudentId().equals(student.getId()))
                    .toList();

            long present = studentAttendance.stream().filter(a -> a.getStatus().equals("PRESENT")).count();
            long absent = studentAttendance.stream().filter(a -> a.getStatus().equals("ABSENT")).count();
            long late = studentAttendance.stream().filter(a -> a.getStatus().equals("LATE")).count();
            long excused = studentAttendance.stream().filter(a -> a.getStatus().equals("EXCUSED")).count();
            
            double percentage = studentAttendance.isEmpty() ? 100.0 : (double)(present + late + excused) / studentAttendance.size() * 100.0;

            return new AttendanceReportEntry(
                    user != null ? user.getFirstName() + " " + user.getLastName() : "Unknown",
                    schoolClass != null ? schoolClass.getName() : "None",
                    studentAttendance.size(), (int)present, (int)absent, (int)late, (int)excused, percentage
            );
        }).toList();
    }

    public List<GradeReportEntry> getGradesReport(String authHeader) {
        authService.requireAuthorizedUser(authHeader);

        List<StudentProfileEntity> students = studentRepo.findAll();
        Map<UUID, UserEntity> users = userRepo.findAll().stream().collect(Collectors.toMap(UserEntity::getId, u -> u));
        Map<UUID, SchoolClassEntity> classes = classRepo.findAll().stream().collect(Collectors.toMap(SchoolClassEntity::getId, c -> c));
        Map<UUID, SubjectEntity> subjects = subjectRepo.findAll().stream().collect(Collectors.toMap(SubjectEntity::getId, s -> s));
        List<GradeRecordEntity> allGrades = gradeRepo.findAll();

        List<GradeReportEntry> report = new ArrayList<>();
        for (StudentProfileEntity student : students) {
            UserEntity user = users.get(student.getUserId());
            SchoolClassEntity schoolClass = classes.get(student.getClassId());
            
            Map<UUID, List<GradeRecordEntity>> gradesBySubject = allGrades.stream()
                    .filter(g -> g.getStudentId().equals(student.getId()))
                    .collect(Collectors.groupingBy(GradeRecordEntity::getSubjectId));

            for (Map.Entry<UUID, List<GradeRecordEntity>> entry : gradesBySubject.entrySet()) {
                SubjectEntity subject = subjects.get(entry.getKey());
                List<GradeRecordEntity> grades = entry.getValue();
                
                double average = grades.stream().mapToDouble(g -> g.getDecimalValue().doubleValue()).average().orElse(0.0);
                
                report.add(new GradeReportEntry(
                        user != null ? user.getFirstName() + " " + user.getLastName() : "Unknown",
                        schoolClass != null ? schoolClass.getName() : "None",
                        subject != null ? subject.getName() : "Unknown",
                        average, grades.size()
                ));
            }
        }
        return report;
    }
}
