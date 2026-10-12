package com.delivery.optimizer.controller;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.service.DataSeederService;
import com.delivery.optimizer.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Application runtime parameters, default objectives, and development data reset")
public class SettingsController {

    private final DataSeederService dataSeederService;
    private final SimulationService simulationService;

    @Value("${app.osm.depot.latitude:12.9716}")
    private double depotLat;

    @Value("${app.osm.depot.longitude:77.5946}")
    private double depotLon;

    @Value("${app.osm.depot.name:Central Logistics Hub}")
    private String depotName;

    private RouteObjective defaultObjective = RouteObjective.MINIMIZE_TIME;

    public SettingsController(DataSeederService dataSeederService,
                              SimulationService simulationService) {
        this.dataSeederService = dataSeederService;
        this.simulationService = simulationService;
    }

    @GetMapping("/config")
    @Operation(summary = "Get system runtime configuration and depot settings")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("defaultObjective", defaultObjective);
        config.put("simulationRunning", simulationService.isRunning());
        config.put("simulationSpeed", simulationService.getSimulationSpeed());
        config.put("depotLatitude", depotLat);
        config.put("depotLongitude", depotLon);
        config.put("depotName", depotName);
        config.put("environment", "DEVELOPMENT_DEMO");
        return ResponseEntity.ok(config);
    }

    @PostMapping("/config")
    @Operation(summary = "Update runtime settings")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> body) {
        if (body.containsKey("defaultObjective")) {
            this.defaultObjective = RouteObjective.valueOf(body.get("defaultObjective").toString());
        }
        if (body.containsKey("simulationSpeed")) {
            double speed = Double.parseDouble(body.get("simulationSpeed").toString());
            simulationService.setSimulationSpeed(speed);
        }
        return getConfig();
    }

    @PostMapping("/reset-data")
    @Operation(summary = "Reset and re-seed sample demo data (development only)")
    public ResponseEntity<Map<String, String>> resetData() {
        dataSeederService.resetDevelopmentData();
        return ResponseEntity.ok(Map.of("message", "Database successfully reset and re-seeded with demonstration data."));
    }
}
