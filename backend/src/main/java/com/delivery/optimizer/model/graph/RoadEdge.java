package com.delivery.optimizer.model.graph;

public class RoadEdge {
    private String id;
    private String sourceNodeId;
    private String destinationNodeId;
    private long distanceMeters;
    private long baseTravelTimeSeconds;
    private double speedKmh;
    private String roadClass;
    private boolean open = true;
    private double trafficMultiplier = 1.0;

    public RoadEdge() {
    }

    public RoadEdge(String id, String sourceNodeId, String destinationNodeId,
                    long distanceMeters, long baseTravelTimeSeconds, double speedKmh,
                    String roadClass) {
        this.id = id;
        this.sourceNodeId = sourceNodeId;
        this.destinationNodeId = destinationNodeId;
        this.distanceMeters = distanceMeters;
        this.baseTravelTimeSeconds = baseTravelTimeSeconds;
        this.speedKmh = speedKmh;
        this.roadClass = roadClass;
        this.open = true;
        this.trafficMultiplier = 1.0;
    }

    public long getEffectiveTravelTimeSeconds() {
        if (!open) {
            return Long.MAX_VALUE / 4; // Effectively blocked/unusable
        }
        return Math.max(1, (long) Math.ceil(baseTravelTimeSeconds * trafficMultiplier));
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSourceNodeId() {
        return sourceNodeId;
    }

    public void setSourceNodeId(String sourceNodeId) {
        this.sourceNodeId = sourceNodeId;
    }

    public String getDestinationNodeId() {
        return destinationNodeId;
    }

    public void setDestinationNodeId(String destinationNodeId) {
        this.destinationNodeId = destinationNodeId;
    }

    public long getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(long distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public long getBaseTravelTimeSeconds() {
        return baseTravelTimeSeconds;
    }

    public void setBaseTravelTimeSeconds(long baseTravelTimeSeconds) {
        this.baseTravelTimeSeconds = baseTravelTimeSeconds;
    }

    public double getSpeedKmh() {
        return speedKmh;
    }

    public void setSpeedKmh(double speedKmh) {
        this.speedKmh = speedKmh;
    }

    public String getRoadClass() {
        return roadClass;
    }

    public void setRoadClass(String roadClass) {
        this.roadClass = roadClass;
    }

    public boolean isOpen() {
        return open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public double getTrafficMultiplier() {
        return trafficMultiplier;
    }

    public void setTrafficMultiplier(double trafficMultiplier) {
        this.trafficMultiplier = trafficMultiplier;
    }
}
