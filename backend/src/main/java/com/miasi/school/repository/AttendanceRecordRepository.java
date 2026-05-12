package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecordEntity, UUID> { List<AttendanceRecordEntity> findByStudentId(UUID studentId); List<AttendanceRecordEntity> findBySessionId(UUID sessionId); }
