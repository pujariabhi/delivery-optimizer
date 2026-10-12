package com.delivery.optimizer.controller;

import com.delivery.optimizer.dto.OptimizeRouteRequest;
import com.delivery.optimizer.dto.RouteOptimizationResultDto;
import com.delivery.optimizer.entity.RoutePlan;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.service.RouteOptimizationService;
import com.delivery.optimizer.service.VehicleAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@Tag(name = "Route Optimization", description = "Dynamic multi-vehicle VRP solver, 2-Opt heuristic, route dispatch, and recalculation")
public class RouteController {

    private final RouteOptimizationService routeOptimizationService;
    private final VehicleAssignmentService vehicleAssignmentService;
    private final RoutePlanRepository routePlanRepository;

    public RouteController(RouteOptimizationService routeOptimizationService,
                           VehicleAssignmentService vehicleAssignmentService,
                           RoutePlanRepository routePlanRepository) {
        this.routeOptimizationService = routeOptimizationService;
        this.vehicleAssignmentService = vehicleAssignmentService;
        this.routePlanRepository = routePlanRepository;
    }

    @PostMapping("/optimize")
    @Operation(summary = "Execute dynamic multi-vehicle route optimization (baseline vs 2-opt improved)")
    public ResponseEntity<RouteOptimizationResultDto> optimizeRoutes(@Valid @RequestBody OptimizeRouteRequest request) {
        return ResponseEntity.ok(routeOptimizationService.optimizeRoutes(request));
    }

    @GetMapping
    @Operation(summary = "Get list of all route plans")
    public ResponseEntity<List<RoutePlan>> getAllRoutePlans() {
        return ResponseEntity.ok(routePlanRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get route plan details including stops and sequences")
    public ResponseEntity<RoutePlan> getRoutePlanById(@PathVariable Long id) {
        RoutePlan plan = routePlanRepository.findByIdWithStops(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoutePlan not found with id: " + id));
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Dispatch and assign route plan to vehicles")
    public ResponseEntity<RoutePlan> assignRoutePlan(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleAssignmentService.assignRoutePlan(id));
    }

    @PostMapping("/{id}/recalculate")
    @Operation(summary = "Trigger dynamic route recalculation due to traffic, new order, or cancellation")
    public ResponseEntity<RouteOptimizationResultDto> recalculateRoutePlan(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.get("reason") : "Manual dispatcher re-optimization trigger";
        return ResponseEntity.ok(routeOptimizationService.recalculateRoutePlan(id, reason));
    }

    @GetMapping("/{id}/comparison")
    @Operation(summary = "Get baseline vs optimized comparison metrics for route plan")
    public ResponseEntity<Map<String, Object>> getRouteComparison(@PathVariable Long id) {
        RoutePlan plan = routePlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoutePlan not found with id: " + id));

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("planId", plan.getId());
        comparison.put("planName", plan.getName());
        comparison.put("objective", plan.getOptimizationObjective());
        comparison.put("baselineDistanceMeters", plan.getBaselineDistanceMeters());
        comparison.put("optimizedDistanceMeters", plan.getTotalDistanceMeters());
        comparison.put("baselineDurationSeconds", plan.getBaselineDurationSeconds());
        comparison.put("optimizedDurationSeconds", plan.getTotalDurationSeconds());
        comparison.put("computationDurationMs", plan.getComputationDurationMs());

        long distDiff = Math.max(0, plan.getBaselineDistanceMeters() - plan.getTotalDistanceMeters());
        long durDiff = Math.max(0, plan.getBaselineDurationSeconds() - plan.getTotalDurationSeconds());
        double distPct = plan.getBaselineDistanceMeters() > 0 ?
                Math.round(((double) distDiff / plan.getBaselineDistanceMeters() * 100.0) * 10.0) / 10.0 : 0.0;
        double durPct = plan.getBaselineDurationSeconds() > 0 ?
                Math.round(((double) durDiff / plan.getBaselineDurationSeconds() * 100.0) * 10.0) / 10.0 : 0.0;

        comparison.put("distanceSavedMeters", distDiff);
        comparison.put("durationSavedSeconds", durDiff);
        comparison.put("distanceSavedPercentage", distPct);
        comparison.put("durationSavedPercentage", durPct);

        return ResponseEntity.ok(comparison);
    }
}
