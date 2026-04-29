package com.miasi.school.service;

import com.miasi.school.dto.BootstrapResponse;
import java.util.Optional;

interface SchoolStateStore {

    Optional<BootstrapResponse> load();

    void save(BootstrapResponse state);
}