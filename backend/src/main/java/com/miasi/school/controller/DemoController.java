package com.miasi.school.controller;

import com.miasi.school.dto.BootstrapResponse;
import com.miasi.school.service.DemoDataStore;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DemoController {

    private final DemoDataStore demoDataStore;

    public DemoController(DemoDataStore demoDataStore) {
        this.demoDataStore = demoDataStore;
    }

    @GetMapping("/bootstrap")
    public BootstrapResponse bootstrap() {
        return demoDataStore.bootstrap();
    }
}