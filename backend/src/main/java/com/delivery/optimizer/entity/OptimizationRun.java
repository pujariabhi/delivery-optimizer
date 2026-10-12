package com.delivery.optimizer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "optimization_runs")
public class OptimizationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_plan_id")
    private RoutePlan routePlan;

    @Column(name = "algorithm_name", nullable = false)
    private String algorithmName;

    @Column(name = "input_order_count", nullable = false)
    private Integer inputOrderCount;

    @Column(name = "input_vehicle_count", nullable = false)
    private Integer inputVehicleCount;

    @Column(name = "baseline_distance_meters", nullable = false)
    private Long baselineDistanceMeters;

    @Column(name = "optimized_distance_meters", nullable = false)
    private Long optimizedDistanceMeters;

    @Column(name = "baseline_duration_seconds", nullable = false)
    private Long baselineDurationSeconds;

    @Column(name = "optimized_duration_seconds", nullable = false)
    private Long optimizedDurationSeconds;

    @Column(name = "computation_duration_ms", nullable = false)
    private Long computationDurationMs;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_status", nullable = false)
    private OptimizationResultStatus resultStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public OptimizationRun() {
    }

    public OptimizationRun(RoutePlan routePlan, String algorithmName, Integer inputOrderCount, Integer inputVehicleCount,
                           Long baselineDistanceMeters, Long optimizedDistanceMeters,
                           Long baselineDurationSeconds, Long optimizedDurationSeconds,
                           Long computationDurationMs, OptimizationResultStatus resultStatus) {
        this.routePlan = routePlan;
        this.algorithmName = algorithmName;
        this.inputOrderCount = inputOrderCount;
        this.inputVehicleCount = inputVehicleCount;
        this.baselineDistanceMeters = baselineDistanceMeters;
        this.optimizedDistanceMeters = optimizedDistanceMeters;
        this.baselineDurationSeconds = baselineDurationSeconds;
        this.optimizedDurationSeconds = optimizedDurationSeconds;
        this.computationDurationMs = computationDurationMs;
        this.resultStatus = resultStatus;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoutePlan getRoutePlan() {
        return routePlan;
    }

    public void setRoutePlan(RoutePlan routePlan) {
        this.routePlan = routePlan;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public Integer getInputOrderCount() {
        return inputOrderCount;
    }

    public void setInputOrderCount(Integer inputOrderCount) {
        this.inputOrderCount = inputOrderCount;
    }

    public Integer getInputVehicleCount() {
        return inputVehicleCount;
    }

    public void setInputVehicleCount(Integer inputVehicleCount) {
        this.inputVehicleCount = inputVehicleCount;
    }

    public Long getBaselineDistanceMeters() {
        return baselineDistanceMeters;
    }

    public void setBaselineDistanceMeters(Long baselineDistanceMeters) {
        this.baselineDistanceMeters = baselineDistanceMeters;
    }

    public Long getOptimizedDistanceMeters() {
        return optimizedDistanceMeters;
    }

    public void setOptimizedDistanceMeters(Long optimizedDistanceMeters) {
        this.optimizedDistanceMeters = optimizedDistanceMeters;
    }

    public Long getBaselineDurationSeconds() {
        return baselineDurationSeconds;
    }

    public void setBaselineDurationSeconds(Long baselineDurationSeconds) {
        this.baselineDurationSeconds = baselineDurationSeconds;
    }

    public Long getOptimizedDurationSeconds() {
        return optimizedDurationSeconds;
    }

    public void setOptimizedDurationSeconds(Long optimizedDurationSeconds) {
        this.optimizedDurationSeconds = optimizedDurationSeconds;
    }

    public Long getComputationDurationMs() {
        return computationDurationMs;
    }

    public void setComputationDurationMs(Long computationDurationMs) {
        this.computationDurationMs = computationDurationMs;
    }

    public OptimizationResultStatus getResultStatus() {
        return resultStatus;
    }

    public void setResultStatus(OptimizationResultStatus resultStatus) {
        this.resultStatus = resultStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
