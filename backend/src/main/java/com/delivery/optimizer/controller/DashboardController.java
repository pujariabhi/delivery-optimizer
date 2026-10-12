package com.delivery.optimizer.controller;

import com.delivery.optimizer.dto.DashboardSummaryDto;
import com.delivery.optimizer.dto.DeliveryTrendDto;
import com.delivery.optimizer.dto.VehicleUtilizationDto;
import com.delivery.optimizer.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Operations for logistics KPIs, delivery trends, and fleet utilization")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level dashboard metrics (orders, vehicles, distance, ETA)")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/delivery-trends")
    @Operation(summary = "Get 7-day delivery volume, completion, and timeliness trends")
    public ResponseEntity<List<DeliveryTrendDto>> getDeliveryTrends() {
        return ResponseEntity.ok(dashboardService.getDeliveryTrends());
    }

    @GetMapping("/vehicle-utilization")
    @Operation(summary = "Get fleet vehicle capacity and route assignment utilization metrics")
    public ResponseEntity<List<VehicleUtilizationDto>> getVehicleUtilization() {
        return ResponseEntity.ok(dashboardService.getVehicleUtilization());
    }
}
