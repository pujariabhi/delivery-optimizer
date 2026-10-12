package com.delivery.optimizer.dto;

import java.util.List;

public class DashboardSummaryDto {
    private long totalOrders;
    private long pendingOrders;
    private long inTransitOrders;
    private long completedDeliveries;
    private long activeVehicles;
    private long totalVehicles;
    private double averageDeliveryTimeMinutes;
    private double totalPlannedDistanceKm;
    private double onTimeDeliveryPercentage;

    public DashboardSummaryDto() {
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getInTransitOrders() {
        return inTransitOrders;
    }

    public void setInTransitOrders(long inTransitOrders) {
        this.inTransitOrders = inTransitOrders;
    }

    public long getCompletedDeliveries() {
        return completedDeliveries;
    }

    public void setCompletedDeliveries(long completedDeliveries) {
        this.completedDeliveries = completedDeliveries;
    }

    public long getActiveVehicles() {
        return activeVehicles;
    }

    public void setActiveVehicles(long activeVehicles) {
        this.activeVehicles = activeVehicles;
    }

    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public double getAverageDeliveryTimeMinutes() {
        return averageDeliveryTimeMinutes;
    }

    public void setAverageDeliveryTimeMinutes(double averageDeliveryTimeMinutes) {
        this.averageDeliveryTimeMinutes = averageDeliveryTimeMinutes;
    }

    public double getTotalPlannedDistanceKm() {
        return totalPlannedDistanceKm;
    }

    public void setTotalPlannedDistanceKm(double totalPlannedDistanceKm) {
        this.totalPlannedDistanceKm = totalPlannedDistanceKm;
    }

    public double getOnTimeDeliveryPercentage() {
        return onTimeDeliveryPercentage;
    }

    public void setOnTimeDeliveryPercentage(double onTimeDeliveryPercentage) {
        this.onTimeDeliveryPercentage = onTimeDeliveryPercentage;
    }
}
