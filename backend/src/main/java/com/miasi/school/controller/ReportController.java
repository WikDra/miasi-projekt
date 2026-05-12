package com.miasi.school.controller;

import com.miasi.school.dto.AttendanceReportEntry;
import com.miasi.school.dto.GradeReportEntry;
import com.miasi.school.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/attendance")
    public List<AttendanceReportEntry> attendanceReport(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return reportService.getAttendanceReport(authorization);
    }

    @GetMapping("/grades")
    public List<GradeReportEntry> gradesReport(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return reportService.getGradesReport(authorization);
    }
}
