package com.delivery.optimizer.dto;

import com.delivery.optimizer.entity.LocationSource;
import com.delivery.optimizer.entity.VehicleStatus;

import java.time.LocalDateTime;

public class VehicleLiveStatusDto {
    private Long vehicleId;
    private String registrationNumber;
    private String driverName;
    private String vehicleType;
    private VehicleStatus status;
    private double latitude;
    private double longitude;
    private double speedKmh;
    private double headingDegrees;
    private LocationSource sourceType = LocationSource.SIMULATED;
    private String nextStopAddress;
    private String nextStopCustomer;
    private LocalDateTime estimatedArrivalTime;
    private int remainingStopsCount;
    private long remainingDistanceMeters;
    private LocalDateTime lastPingTime;

    public VehicleLiveStatusDto() {
        this.lastPingTime = LocalDateTime.now();
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

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getSpeedKmh() {
        return speedKmh;
    }

    public void setSpeedKmh(double speedKmh) {
        this.speedKmh = speedKmh;
    }

    public double getHeadingDegrees() {
        return headingDegrees;
    }

    public void setHeadingDegrees(double headingDegrees) {
        this.headingDegrees = headingDegrees;
    }

    public LocationSource getSourceType() {
        return sourceType;
    }

    public void setSourceType(LocationSource sourceType) {
        this.sourceType = sourceType;
    }

    public String getNextStopAddress() {
        return nextStopAddress;
    }

    public void setNextStopAddress(String nextStopAddress) {
        this.nextStopAddress = nextStopAddress;
    }

    public String getNextStopCustomer() {
        return nextStopCustomer;
    }

    public void setNextStopCustomer(String nextStopCustomer) {
        this.nextStopCustomer = nextStopCustomer;
    }

    public LocalDateTime getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public int getRemainingStopsCount() {
        return remainingStopsCount;
    }

    public void setRemainingStopsCount(int remainingStopsCount) {
        this.remainingStopsCount = remainingStopsCount;
    }

    public long getRemainingDistanceMeters() {
        return remainingDistanceMeters;
    }

    public void setRemainingDistanceMeters(long remainingDistanceMeters) {
        this.remainingDistanceMeters = remainingDistanceMeters;
    }

    public LocalDateTime getLastPingTime() {
        return lastPingTime;
    }

    public void setLastPingTime(LocalDateTime lastPingTime) {
        this.lastPingTime = lastPingTime;
    }
}
