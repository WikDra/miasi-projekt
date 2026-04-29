package com.miasi.school.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.dto.BootstrapResponse;
import java.util.Optional;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
class JdbcSchoolStateStore implements SchoolStateStore {

    private static final String STATE_KEY = "bootstrap";

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    JdbcSchoolStateStore(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        createTableIfNeeded();
    }

    @Override
    public Optional<BootstrapResponse> load() {
        try {
            String payload = jdbcTemplate.queryForObject(
                    "select payload from school_state where state_key = ?",
                    String.class,
                    STATE_KEY
            );

            if (payload == null || payload.isBlank()) {
                return Optional.empty();
            }

            return Optional.of(objectMapper.readValue(payload, BootstrapResponse.class));
        } catch (EmptyResultDataAccessException exception) {
            return Optional.empty();
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Nie udało się odczytać stanu aplikacji z bazy", exception);
        }
    }

    @Override
    public void save(BootstrapResponse state) {
        try {
            String payload = objectMapper.writeValueAsString(state);
            jdbcTemplate.update(
                    """
                            MERGE INTO school_state (state_key, payload, updated_at)
                            KEY (state_key)
                            VALUES (?, ?, CURRENT_TIMESTAMP)
                            """,
                    STATE_KEY,
                    payload
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Nie udało się zapisać stanu aplikacji do bazy", exception);
        }
    }

    private void createTableIfNeeded() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS school_state (
                    state_key VARCHAR(64) PRIMARY KEY,
                    payload CLOB NOT NULL,
                    updated_at TIMESTAMP NOT NULL
                )
                """);
    }
}