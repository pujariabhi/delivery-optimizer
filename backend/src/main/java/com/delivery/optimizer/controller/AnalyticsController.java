package com.delivery.optimizer.controller;

import com.delivery.optimizer.dto.AnalyticsSummaryDto;
import com.delivery.optimizer.entity.OptimizationRun;
import com.delivery.optimizer.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "VRP algorithm benchmark metrics, ETA MAE/RMSE error evaluations, and performance gains")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get overall analytics summary (savings %, ETA MAE/RMSE, execution times)")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
    }

    @GetMapping("/optimization-runs")
    @Operation(summary = "Get historical route optimization runs and benchmark comparisons")
    public ResponseEntity<Page<OptimizationRun>> getOptimizationRuns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(analyticsService.getOptimizationRuns(pageRequest));
    }
}
