package com.miasi.school.repository;

import com.miasi.school.entity.SchoolEntities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> { Optional<UserEntity> findByEmailIgnoreCase(String email); }
