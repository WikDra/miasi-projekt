package com.miasi.school.dto;

import com.miasi.school.model.SchoolDomain;
import java.util.List;

public record BootstrapResponse(
        SchoolDomain.DashboardSummary summary,
        List<SchoolDomain.Role> roles,
        List<SchoolDomain.User> users,
        List<SchoolDomain.TeacherProfile> teachers,
        List<SchoolDomain.StudentProfile> students,
        List<SchoolDomain.ParentProfile> parents,
        List<SchoolDomain.SecretaryProfile> secretaries,
        List<SchoolDomain.PrincipalProfile> principals,
        List<SchoolDomain.SchoolClass> classes,
        List<SchoolDomain.Subject> subjects,
        List<SchoolDomain.ScheduleEntry> schedule,
        List<SchoolDomain.ClassSession> classSessions,
        List<SchoolDomain.AttendanceRecord> attendance,
        List<SchoolDomain.GradeRecord> grades,
        List<SchoolDomain.Message> messages,
        List<SchoolDomain.Notification> notifications,
        List<SchoolDomain.TeachingMaterial> teachingMaterials
) {
}