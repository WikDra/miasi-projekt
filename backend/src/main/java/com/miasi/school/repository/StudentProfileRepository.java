package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfileEntity, UUID> { Optional<StudentProfileEntity> findByUserId(UUID userId); List<StudentProfileEntity> findByClassId(UUID classId); List<StudentProfileEntity> findByParentId(UUID parentId); }
