package com.miasi.school.controller;

import com.miasi.school.dto.BootstrapResponse;
import com.miasi.school.service.BootstrapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BootstrapController {

    private final BootstrapService bootstrapService;

    public BootstrapController(BootstrapService bootstrapService) {
        this.bootstrapService = bootstrapService;
    }

    @GetMapping("/bootstrap")
    public BootstrapResponse bootstrap() {
        return bootstrapService.bootstrap();
    }
}
