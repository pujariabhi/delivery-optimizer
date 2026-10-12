package com.delivery.optimizer.service;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.entity.TrafficType;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.model.graph.RoadNode;
import com.delivery.optimizer.model.graph.ShortestPathResult;

import java.util.List;

public interface TravelTimeService {
    RoadGraph getRoadGraph();
    void applyTrafficScenario(TrafficType trafficType, List<String> closedEdgeIds);
    ShortestPathResult computeRouteBetweenCoordinates(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective);
    long getRoadDistanceMeters(double fromLat, double fromLon, double toLat, double toLon);
    long getTravelTimeSeconds(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective);
    double getStraightLineDistanceMeters(double fromLat, double fromLon, double toLat, double toLon);
    long[][] computeTravelTimeMatrix(List<RoadNode> locations, RouteObjective objective);
    long[][] computeDistanceMatrix(List<RoadNode> locations);
}
