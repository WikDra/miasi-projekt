package com.miasi.school.controller;

import com.miasi.school.dto.AttendanceReportEntry;
import com.miasi.school.dto.GradeReportEntry;
import com.miasi.school.service.DemoDataStore;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final DemoDataStore demoDataStore;

    public ReportController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @GetMapping("/attendance")
    public List<AttendanceReportEntry> attendanceReport(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return demoDataStore.getAttendanceReport(authorization);
    }

    @GetMapping("/grades")
    public List<GradeReportEntry> gradesReport(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return demoDataStore.getGradesReport(authorization);
    }
}
