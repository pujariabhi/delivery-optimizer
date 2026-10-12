package com.delivery.optimizer.dto;

import com.delivery.optimizer.entity.OrderPriority;
import com.delivery.optimizer.entity.StopStatus;

import java.time.LocalDateTime;

public class RouteStopDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String customerName;
    private String deliveryAddress;
    private double latitude;
    private double longitude;
    private double packageWeightKg;
    private OrderPriority priority;
    private String timeWindowStart;
    private String timeWindowEnd;
    private int stopSequence;
    private LocalDateTime estimatedArrivalTime;
    private LocalDateTime actualArrivalTime;
    private StopStatus status;
    private long distanceFromPrevMeters;
    private long travelTimeFromPrevSeconds;

    public RouteStopDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
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

    public double getPackageWeightKg() {
        return packageWeightKg;
    }

    public void setPackageWeightKg(double packageWeightKg) {
        this.packageWeightKg = packageWeightKg;
    }

    public OrderPriority getPriority() {
        return priority;
    }

    public void setPriority(OrderPriority priority) {
        this.priority = priority;
    }

    public String getTimeWindowStart() {
        return timeWindowStart;
    }

    public void setTimeWindowStart(String timeWindowStart) {
        this.timeWindowStart = timeWindowStart;
    }

    public String getTimeWindowEnd() {
        return timeWindowEnd;
    }

    public void setTimeWindowEnd(String timeWindowEnd) {
        this.timeWindowEnd = timeWindowEnd;
    }

    public int getStopSequence() {
        return stopSequence;
    }

    public void setStopSequence(int stopSequence) {
        this.stopSequence = stopSequence;
    }

    public LocalDateTime getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public LocalDateTime getActualArrivalTime() {
        return actualArrivalTime;
    }

    public void setActualArrivalTime(LocalDateTime actualArrivalTime) {
        this.actualArrivalTime = actualArrivalTime;
    }

    public StopStatus getStatus() {
        return status;
    }

    public void setStatus(StopStatus status) {
        this.status = status;
    }

    public long getDistanceFromPrevMeters() {
        return distanceFromPrevMeters;
    }

    public void setDistanceFromPrevMeters(long distanceFromPrevMeters) {
        this.distanceFromPrevMeters = distanceFromPrevMeters;
    }

    public long getTravelTimeFromPrevSeconds() {
        return travelTimeFromPrevSeconds;
    }

    public void setTravelTimeFromPrevSeconds(long travelTimeFromPrevSeconds) {
        this.travelTimeFromPrevSeconds = travelTimeFromPrevSeconds;
    }
}
