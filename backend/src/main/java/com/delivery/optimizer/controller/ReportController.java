package com.delivery.optimizer.controller;

import com.delivery.optimizer.service.CsvExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports Export", description = "Export delivery orders and route plans to standard CSV format")
public class ReportController {

    private final CsvExportService csvExportService;

    public ReportController(CsvExportService csvExportService) {
        this.csvExportService = csvExportService;
    }

    @GetMapping("/orders.csv")
    @Operation(summary = "Export all delivery orders to CSV")
    public void exportOrdersCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"delivery_orders.csv\"");
        csvExportService.exportOrdersCsv(response.getWriter());
    }

    @GetMapping("/routes.csv")
    @Operation(summary = "Export all route plans and assigned stops to CSV")
    public void exportRoutesCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"route_plans.csv\"");
        csvExportService.exportRoutesCsv(response.getWriter());
    }
}
