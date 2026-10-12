package com.delivery.optimizer.model.graph;

import java.util.ArrayList;
import java.util.List;

public class ShortestPathResult {
    private List<RoadNode> pathNodes = new ArrayList<>();
    private List<RoadEdge> pathEdges = new ArrayList<>();
    private long totalDistanceMeters;
    private long totalTravelTimeSeconds;
    private boolean reachable;

    public ShortestPathResult() {
        this.reachable = false;
    }

    public ShortestPathResult(List<RoadNode> pathNodes, List<RoadEdge> pathEdges,
                              long totalDistanceMeters, long totalTravelTimeSeconds, boolean reachable) {
        this.pathNodes = pathNodes;
        this.pathEdges = pathEdges;
        this.totalDistanceMeters = totalDistanceMeters;
        this.totalTravelTimeSeconds = totalTravelTimeSeconds;
        this.reachable = reachable;
    }

    public static ShortestPathResult unreachable() {
        ShortestPathResult res = new ShortestPathResult();
        res.setReachable(false);
        res.setTotalDistanceMeters(Long.MAX_VALUE / 4);
        res.setTotalTravelTimeSeconds(Long.MAX_VALUE / 4);
        return res;
    }

    public List<RoadNode> getPathNodes() {
        return pathNodes;
    }

    public void setPathNodes(List<RoadNode> pathNodes) {
        this.pathNodes = pathNodes;
    }

    public List<RoadEdge> getPathEdges() {
        return pathEdges;
    }

    public void setPathEdges(List<RoadEdge> pathEdges) {
        this.pathEdges = pathEdges;
    }

    public long getTotalDistanceMeters() {
        return totalDistanceMeters;
    }

    public void setTotalDistanceMeters(long totalDistanceMeters) {
        this.totalDistanceMeters = totalDistanceMeters;
    }

    public long getTotalTravelTimeSeconds() {
        return totalTravelTimeSeconds;
    }

    public void setTotalTravelTimeSeconds(long totalTravelTimeSeconds) {
        this.totalTravelTimeSeconds = totalTravelTimeSeconds;
    }

    public boolean isReachable() {
        return reachable;
    }

    public void setReachable(boolean reachable) {
        this.reachable = reachable;
    }
}
