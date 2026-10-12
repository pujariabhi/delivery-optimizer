package com.delivery.optimizer.dto;

public class DeliveryTrendDto {
    private String dateLabel;
    private long totalOrders;
    private long completedOrders;
    private long onTimeOrders;
    private double avgCompletionTimeMinutes;

    public DeliveryTrendDto() {
    }

    public DeliveryTrendDto(String dateLabel, long totalOrders, long completedOrders, long onTimeOrders, double avgCompletionTimeMinutes) {
        this.dateLabel = dateLabel;
        this.totalOrders = totalOrders;
        this.completedOrders = completedOrders;
        this.onTimeOrders = onTimeOrders;
        this.avgCompletionTimeMinutes = avgCompletionTimeMinutes;
    }

    public String getDateLabel() {
        return dateLabel;
    }

    public void setDateLabel(String dateLabel) {
        this.dateLabel = dateLabel;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public long getOnTimeOrders() {
        return onTimeOrders;
    }

    public void setOnTimeOrders(long onTimeOrders) {
        this.onTimeOrders = onTimeOrders;
    }

    public double getAvgCompletionTimeMinutes() {
        return avgCompletionTimeMinutes;
    }

    public void setAvgCompletionTimeMinutes(double avgCompletionTimeMinutes) {
        this.avgCompletionTimeMinutes = avgCompletionTimeMinutes;
    }
}
