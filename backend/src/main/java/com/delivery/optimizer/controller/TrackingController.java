package com.delivery.optimizer.controller;

import com.delivery.optimizer.dto.VehicleLiveStatusDto;
import com.delivery.optimizer.entity.VehicleLocation;
import com.delivery.optimizer.repository.VehicleLocationRepository;
import com.delivery.optimizer.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Live Tracking & Simulation", description = "Real-time vehicle GPS feeds, position histories, and simulator control")
public class TrackingController {

    private final SimulationService simulationService;
    private final VehicleLocationRepository locationRepository;

    public TrackingController(SimulationService simulationService,
                              VehicleLocationRepository locationRepository) {
        this.simulationService = simulationService;
        this.locationRepository = locationRepository;
    }

    @GetMapping("/api/tracking/vehicles")
    @Operation(summary = "Get live GPS positions and statuses for all vehicles")
    public ResponseEntity<List<VehicleLiveStatusDto>> getLiveVehicles() {
        return ResponseEntity.ok(simulationService.getLiveVehicleStatuses());
    }

    @GetMapping("/api/tracking/vehicles/{id}/history")
    @Operation(summary = "Get bounded GPS location history for a vehicle (prevents unbounded memory consumption)")
    public ResponseEntity<List<VehicleLocation>> getVehicleHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit) {
        int boundedLimit = Math.min(200, Math.max(1, limit));
        return ResponseEntity.ok(locationRepository.findByVehicleIdOrderByRecordedAtDesc(id, PageRequest.of(0, boundedLimit)));
    }

    @PostMapping("/api/simulation/start")
    @Operation(summary = "Start backend vehicle movement simulation along valid routes")
    public ResponseEntity<Map<String, Object>> startSimulation() {
        simulationService.startSimulation();
        Map<String, Object> resp = new HashMap<>();
        resp.put("running", true);
        resp.put("speed", simulationService.getSimulationSpeed());
        resp.put("message", "Simulation started successfully. Broadcasting to /topic/vehicle-locations.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/simulation/stop")
    @Operation(summary = "Pause backend vehicle movement simulation")
    public ResponseEntity<Map<String, Object>> stopSimulation() {
        simulationService.stopSimulation();
        Map<String, Object> resp = new HashMap<>();
        resp.put("running", false);
        resp.put("message", "Simulation stopped.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/simulation/status")
    @Operation(summary = "Get simulation status and current speed multiplier")
    public ResponseEntity<Map<String, Object>> getSimulationStatus() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("running", simulationService.isRunning());
        resp.put("speed", simulationService.getSimulationSpeed());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/simulation/speed")
    @Operation(summary = "Configure simulation speed multiplier (0.5x to 5.0x)")
    public ResponseEntity<Map<String, Object>> setSimulationSpeed(@RequestBody Map<String, Double> body) {
        Double speed = body.get("speed");
        if (speed != null) {
            simulationService.setSimulationSpeed(speed);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("running", simulationService.isRunning());
        resp.put("speed", simulationService.getSimulationSpeed());
        return ResponseEntity.ok(resp);
    }
}
