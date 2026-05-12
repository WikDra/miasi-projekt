package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrincipalProfileRepository extends JpaRepository<PrincipalProfileEntity, UUID> { Optional<PrincipalProfileEntity> findByUserId(UUID userId); }
