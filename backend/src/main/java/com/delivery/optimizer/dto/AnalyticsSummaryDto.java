package com.delivery.optimizer.dto;

public class AnalyticsSummaryDto {
    private long totalPlannedDistanceMeters;
    private long totalEstimatedTravelTimeSeconds;
    private long totalDistanceSavedMeters;
    private long totalDurationSavedSeconds;
    private double distanceSavedPercentage;
    private double durationSavedPercentage;
    private double avgComputationDurationMs;
    private double onTimeDeliveryRate;
    private double avgVehicleUtilizationPercentage;
    private double deliveryCompletionRate;
    private double etaMaeMinutes;
    private double etaRmseMinutes;
    private int totalOptimizationRuns;

    public AnalyticsSummaryDto() {
    }

    public long getTotalPlannedDistanceMeters() {
        return totalPlannedDistanceMeters;
    }

    public void setTotalPlannedDistanceMeters(long totalPlannedDistanceMeters) {
        this.totalPlannedDistanceMeters = totalPlannedDistanceMeters;
    }

    public long getTotalEstimatedTravelTimeSeconds() {
        return totalEstimatedTravelTimeSeconds;
    }

    public void setTotalEstimatedTravelTimeSeconds(long totalEstimatedTravelTimeSeconds) {
        this.totalEstimatedTravelTimeSeconds = totalEstimatedTravelTimeSeconds;
    }

    public long getTotalDistanceSavedMeters() {
        return totalDistanceSavedMeters;
    }

    public void setTotalDistanceSavedMeters(long totalDistanceSavedMeters) {
        this.totalDistanceSavedMeters = totalDistanceSavedMeters;
    }

    public long getTotalDurationSavedSeconds() {
        return totalDurationSavedSeconds;
    }

    public void setTotalDurationSavedSeconds(long totalDurationSavedSeconds) {
        this.totalDurationSavedSeconds = totalDurationSavedSeconds;
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

    public double getAvgComputationDurationMs() {
        return avgComputationDurationMs;
    }

    public void setAvgComputationDurationMs(double avgComputationDurationMs) {
        this.avgComputationDurationMs = avgComputationDurationMs;
    }

    public double getOnTimeDeliveryRate() {
        return onTimeDeliveryRate;
    }

    public void setOnTimeDeliveryRate(double onTimeDeliveryRate) {
        this.onTimeDeliveryRate = onTimeDeliveryRate;
    }

    public double getAvgVehicleUtilizationPercentage() {
        return avgVehicleUtilizationPercentage;
    }

    public void setAvgVehicleUtilizationPercentage(double avgVehicleUtilizationPercentage) {
        this.avgVehicleUtilizationPercentage = avgVehicleUtilizationPercentage;
    }

    public double getDeliveryCompletionRate() {
        return deliveryCompletionRate;
    }

    public void setDeliveryCompletionRate(double deliveryCompletionRate) {
        this.deliveryCompletionRate = deliveryCompletionRate;
    }

    public double getEtaMaeMinutes() {
        return etaMaeMinutes;
    }

    public void setEtaMaeMinutes(double etaMaeMinutes) {
        this.etaMaeMinutes = etaMaeMinutes;
    }

    public double getEtaRmseMinutes() {
        return etaRmseMinutes;
    }

    public void setEtaRmseMinutes(double etaRmseMinutes) {
        this.etaRmseMinutes = etaRmseMinutes;
    }

    public int getTotalOptimizationRuns() {
        return totalOptimizationRuns;
    }

    public void setTotalOptimizationRuns(int totalOptimizationRuns) {
        this.totalOptimizationRuns = totalOptimizationRuns;
    }
}
