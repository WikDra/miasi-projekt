package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, UUID> { Optional<SubjectEntity> findByNameIgnoreCase(String name); }
