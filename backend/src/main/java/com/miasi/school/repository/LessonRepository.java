package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, UUID> { List<LessonEntity> findByClassId(UUID classId); List<LessonEntity> findByTeacherId(UUID teacherId); List<LessonEntity> findBySubjectId(UUID subjectId); }
