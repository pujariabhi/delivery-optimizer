package com.delivery.optimizer.dto;

public class VehicleUtilizationDto {
    private Long vehicleId;
    private String registrationNumber;
    private String driverName;
    private String vehicleType;
    private double capacityKg;
    private double currentAssignedLoadKg;
    private double utilizationPercentage;
    private int assignedStopsCount;
    private String status;

    public VehicleUtilizationDto() {
    }

    public VehicleUtilizationDto(Long vehicleId, String registrationNumber, String driverName,
                                 String vehicleType, double capacityKg, double currentAssignedLoadKg,
                                 double utilizationPercentage, int assignedStopsCount, String status) {
        this.vehicleId = vehicleId;
        this.registrationNumber = registrationNumber;
        this.driverName = driverName;
        this.vehicleType = vehicleType;
        this.capacityKg = capacityKg;
        this.currentAssignedLoadKg = currentAssignedLoadKg;
        this.utilizationPercentage = utilizationPercentage;
        this.assignedStopsCount = assignedStopsCount;
        this.status = status;
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

    public double getCapacityKg() {
        return capacityKg;
    }

    public void setCapacityKg(double capacityKg) {
        this.capacityKg = capacityKg;
    }

    public double getCurrentAssignedLoadKg() {
        return currentAssignedLoadKg;
    }

    public void setCurrentAssignedLoadKg(double currentAssignedLoadKg) {
        this.currentAssignedLoadKg = currentAssignedLoadKg;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public int getAssignedStopsCount() {
        return assignedStopsCount;
    }

    public void setAssignedStopsCount(int assignedStopsCount) {
        this.assignedStopsCount = assignedStopsCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
