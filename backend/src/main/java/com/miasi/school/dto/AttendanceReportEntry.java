package com.miasi.school.dto;

public record AttendanceReportEntry(
        String studentName,
        String className,
        int totalSessions,
        int present,
        int absent,
        int late,
        int excused,
        double attendancePercentage
) {
}
