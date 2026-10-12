package com.delivery.optimizer.controller;

import com.delivery.optimizer.entity.TrafficScenario;
import com.delivery.optimizer.entity.TrafficType;
import com.delivery.optimizer.service.TrafficService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traffic")
@Tag(name = "Traffic Management", description = "Simulated traffic scenarios (Normal, Monsoon, Peak Gridlock, Road Closures)")
public class TrafficController {

    private final TrafficService trafficService;

    public TrafficController(TrafficService trafficService) {
        this.trafficService = trafficService;
    }

    @GetMapping("/scenarios")
    @Operation(summary = "Get all configured traffic scenarios")
    public ResponseEntity<List<TrafficScenario>> getScenarios() {
        return ResponseEntity.ok(trafficService.getAllScenarios());
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active traffic scenario")
    public ResponseEntity<TrafficScenario> getActiveScenario() {
        return ResponseEntity.ok(trafficService.getActiveScenario());
    }

    @PatchMapping("/scenarios/{id}/activate")
    @Operation(summary = "Activate a traffic scenario and trigger automatic dynamic route recalculation")
    public ResponseEntity<TrafficScenario> activateScenario(@PathVariable Long id) {
        return ResponseEntity.ok(trafficService.activateScenario(id));
    }

    @PostMapping("/scenarios")
    @Operation(summary = "Create a custom traffic scenario with road adjustments")
    public ResponseEntity<TrafficScenario> createScenario(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "Custom Scenario");
        String typeStr = body.getOrDefault("scenarioType", "MODERATE");
        String configJson = body.getOrDefault("configurationJson", "{}");

        TrafficType type = TrafficType.valueOf(typeStr.toUpperCase());
        TrafficScenario created = trafficService.createScenario(name, type, configJson);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
