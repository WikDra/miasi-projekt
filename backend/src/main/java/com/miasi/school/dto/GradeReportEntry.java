package com.miasi.school.dto;

public record GradeReportEntry(
        String studentName,
        String className,
        String subjectName,
        double average,
        int gradeCount
) {
}
