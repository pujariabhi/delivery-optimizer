package com.delivery.optimizer.model.graph;

import java.util.*;

public class RoadGraph {
    private final Map<String, RoadNode> nodes = new LinkedHashMap<>();
    private final Map<String, List<RoadEdge>> adjacencyList = new LinkedHashMap<>();
    private final Map<String, RoadEdge> edges = new LinkedHashMap<>();

    public void addNode(RoadNode node) {
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    public void addBidirectionalEdge(String id, String u, String v, long distanceMeters,
                                     long baseTravelTimeSeconds, double speedKmh, String roadClass) {
        RoadEdge forward = new RoadEdge(id + "_fw", u, v, distanceMeters, baseTravelTimeSeconds, speedKmh, roadClass);
        RoadEdge backward = new RoadEdge(id + "_bw", v, u, distanceMeters, baseTravelTimeSeconds, speedKmh, roadClass);
        addEdge(forward);
        addEdge(backward);
    }

    public void addEdge(RoadEdge edge) {
        edges.put(edge.getId(), edge);
        adjacencyList.computeIfAbsent(edge.getSourceNodeId(), k -> new ArrayList<>()).add(edge);
    }

    public RoadNode getNode(String id) {
        return nodes.get(id);
    }

    public Collection<RoadNode> getAllNodes() {
        return nodes.values();
    }

    public Collection<RoadEdge> getAllEdges() {
        return edges.values();
    }

    public List<RoadEdge> getOutgoingEdges(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    public RoadNode findNearestNode(double latitude, double longitude) {
        RoadNode nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (RoadNode node : nodes.values()) {
            double dist = haversineDistanceMeters(latitude, longitude, node.getLatitude(), node.getLongitude());
            if (dist < minDistance) {
                minDistance = dist;
                nearest = node;
            }
        }
        return nearest;
    }

    /**
     * Straight-line distance calculation using the Haversine formula on WGS84 sphere.
     */
    public static double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000; // Earth radius in meters
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0) +
                   Math.cos(phi1) * Math.cos(phi2) *
                   Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

        return R * c;
    }

    public void clear() {
        nodes.clear();
        adjacencyList.clear();
        edges.clear();
    }
}
