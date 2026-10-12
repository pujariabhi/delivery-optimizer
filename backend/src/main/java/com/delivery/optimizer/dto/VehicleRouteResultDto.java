package com.delivery.optimizer.dto;

import java.util.ArrayList;
import java.util.List;

public class VehicleRouteResultDto {
    private Long vehicleId;
    private String registrationNumber;
    private String driverName;
    private String vehicleType;
    private double totalLoadKg;
    private double maxCapacityKg;
    private long totalDistanceMeters;
    private long totalDurationSeconds;
    private List<RouteStopDto> stops = new ArrayList<>();
    private List<CoordinateDto> polyline = new ArrayList<>();

    public VehicleRouteResultDto() {
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public double getTotalLoadKg() {
        return totalLoadKg;
    }

    public void setTotalLoadKg(double totalLoadKg) {
        this.totalLoadKg = totalLoadKg;
    }

    public double getMaxCapacityKg() {
        return maxCapacityKg;
    }

    public void setMaxCapacityKg(double maxCapacityKg) {
        this.maxCapacityKg = maxCapacityKg;
    }

    public long getTotalDistanceMeters() {
        return totalDistanceMeters;
    }

    public void setTotalDistanceMeters(long totalDistanceMeters) {
        this.totalDistanceMeters = totalDistanceMeters;
    }

    public long getTotalDurationSeconds() {
        return totalDurationSeconds;
    }

    public void setTotalDurationSeconds(long totalDurationSeconds) {
        this.totalDurationSeconds = totalDurationSeconds;
    }

    public List<RouteStopDto> getStops() {
        return stops;
    }

    public void setStops(List<RouteStopDto> stops) {
        this.stops = stops;
    }

    public List<CoordinateDto> getPolyline() {
        return polyline;
    }

    public void setPolyline(List<CoordinateDto> polyline) {
        this.polyline = polyline;
    }
}
