package com.delivery.optimizer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "route_plans")
public class RoutePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "optimization_objective", nullable = false)
    private RouteObjective optimizationObjective;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status;

    @Column(name = "total_distance_meters", nullable = false)
    private Long totalDistanceMeters;

    @Column(name = "total_duration_seconds", nullable = false)
    private Long totalDurationSeconds;

    @Column(name = "baseline_distance_meters", nullable = false)
    private Long baselineDistanceMeters;

    @Column(name = "baseline_duration_seconds", nullable = false)
    private Long baselineDurationSeconds;

    @Column(name = "computation_duration_ms", nullable = false)
    private Long computationDurationMs;

    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "recalculation_reason")
    private String recalculationReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "routePlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stopSequence ASC")
    private List<RouteStop> stops = new ArrayList<>();

    public RoutePlan() {
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public void addStop(RouteStop stop) {
        stops.add(stop);
        stop.setRoutePlan(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RouteObjective getOptimizationObjective() {
        return optimizationObjective;
    }

    public void setOptimizationObjective(RouteObjective optimizationObjective) {
        this.optimizationObjective = optimizationObjective;
    }

    public RouteStatus getStatus() {
        return status;
    }

    public void setStatus(RouteStatus status) {
        this.status = status;
    }

    public Long getTotalDistanceMeters() {
        return totalDistanceMeters;
    }

    public void setTotalDistanceMeters(Long totalDistanceMeters) {
        this.totalDistanceMeters = totalDistanceMeters;
    }

    public Long getTotalDurationSeconds() {
        return totalDurationSeconds;
    }

    public void setTotalDurationSeconds(Long totalDurationSeconds) {
        this.totalDurationSeconds = totalDurationSeconds;
    }

    public Long getBaselineDistanceMeters() {
        return baselineDistanceMeters;
    }

    public void setBaselineDistanceMeters(Long baselineDistanceMeters) {
        this.baselineDistanceMeters = baselineDistanceMeters;
    }

    public Long getBaselineDurationSeconds() {
        return baselineDurationSeconds;
    }

    public void setBaselineDurationSeconds(Long baselineDurationSeconds) {
        this.baselineDurationSeconds = baselineDurationSeconds;
    }

    public Long getComputationDurationMs() {
        return computationDurationMs;
    }

    public void setComputationDurationMs(Long computationDurationMs) {
        this.computationDurationMs = computationDurationMs;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getRecalculationReason() {
        return recalculationReason;
    }

    public void setRecalculationReason(String recalculationReason) {
        this.recalculationReason = recalculationReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<RouteStop> getStops() {
        return stops;
    }

    public void setStops(List<RouteStop> stops) {
        this.stops = stops;
    }
}
