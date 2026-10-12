package com.delivery.optimizer.dto;

import com.delivery.optimizer.entity.OptimizationResultStatus;
import com.delivery.optimizer.entity.RouteObjective;

import java.util.ArrayList;
import java.util.List;

public class RouteOptimizationResultDto {
    private Long routePlanId;
    private String name;
    private RouteObjective objective;
    private OptimizationResultStatus status;
    private String message;
    private long baselineDistanceMeters;
    private long baselineDurationSeconds;
    private long optimizedDistanceMeters;
    private long optimizedDurationSeconds;
    private double distanceSavedPercentage;
    private double durationSavedPercentage;
    private long computationDurationMs;
    private List<VehicleRouteResultDto> vehicleRoutes = new ArrayList<>();
    private List<VehicleRouteResultDto> baselineRoutes = new ArrayList<>();

    public RouteOptimizationResultDto() {
    }

    public Long getRoutePlanId() {
        return routePlanId;
    }

    public void setRoutePlanId(Long routePlanId) {
        this.routePlanId = routePlanId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RouteObjective getObjective() {
        return objective;
    }

    public void setObjective(RouteObjective objective) {
        this.objective = objective;
    }

    public OptimizationResultStatus getStatus() {
        return status;
    }

    public void setStatus(OptimizationResultStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getBaselineDistanceMeters() {
        return baselineDistanceMeters;
    }

    public void setBaselineDistanceMeters(long baselineDistanceMeters) {
        this.baselineDistanceMeters = baselineDistanceMeters;
    }

    public long getBaselineDurationSeconds() {
        return baselineDurationSeconds;
    }

    public void setBaselineDurationSeconds(long baselineDurationSeconds) {
        this.baselineDurationSeconds = baselineDurationSeconds;
    }

    public long getOptimizedDistanceMeters() {
        return optimizedDistanceMeters;
    }

    public void setOptimizedDistanceMeters(long optimizedDistanceMeters) {
        this.optimizedDistanceMeters = optimizedDistanceMeters;
    }

    public long getOptimizedDurationSeconds() {
        return optimizedDurationSeconds;
    }

    public void setOptimizedDurationSeconds(long optimizedDurationSeconds) {
        this.optimizedDurationSeconds = optimizedDurationSeconds;
    }

    public double getDistanceSavedPercentage() {
        return distanceSavedPercentage;
    }

    public void setDistanceSavedPercentage(double distanceSavedPercentage) {
        this.distanceSavedPercentage = distanceSavedPercentage;
    }

    public double getDurationSavedPercentage() {
        return durationSavedPercentage;
    }

    public void setDurationSavedPercentage(double durationSavedPercentage) {
        this.durationSavedPercentage = durationSavedPercentage;
    }

    public long getComputationDurationMs() {
        return computationDurationMs;
    }

    public void setComputationDurationMs(long computationDurationMs) {
        this.computationDurationMs = computationDurationMs;
    }

    public List<VehicleRouteResultDto> getVehicleRoutes() {
        return vehicleRoutes;
    }

    public void setVehicleRoutes(List<VehicleRouteResultDto> vehicleRoutes) {
        this.vehicleRoutes = vehicleRoutes;
    }

    public List<VehicleRouteResultDto> getBaselineRoutes() {
        return baselineRoutes;
    }

    public void setBaselineRoutes(List<VehicleRouteResultDto> baselineRoutes) {
        this.baselineRoutes = baselineRoutes;
    }
}
