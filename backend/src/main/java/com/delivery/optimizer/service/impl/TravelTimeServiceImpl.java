package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.entity.TrafficType;
import com.delivery.optimizer.model.graph.RoadEdge;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.model.graph.RoadNode;
import com.delivery.optimizer.model.graph.ShortestPathResult;
import com.delivery.optimizer.service.ShortestPathService;
import com.delivery.optimizer.service.TravelTimeService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TravelTimeServiceImpl implements TravelTimeService {

    private static final Logger log = LoggerFactory.getLogger(TravelTimeServiceImpl.class);

    private final ShortestPathService shortestPathService;
    private final RoadGraph roadGraph = new RoadGraph();
    private TrafficType currentTrafficType = TrafficType.NORMAL;
    private final Set<String> closedEdges = new HashSet<>();

    public TravelTimeServiceImpl(ShortestPathService shortestPathService) {
        this.shortestPathService = shortestPathService;
    }

    @PostConstruct
    public void initRoadNetwork() {
        log.info("Initializing urban road network graph...");
        roadGraph.clear();

        // 16 key interconnected nodes in Bangalore delivery district
        addNode("DEPOT", "Central Logistics Hub", 12.9716, 77.5946);
        addNode("NODE_MG", "MG Road Commercial Junction", 12.9750, 77.6090);
        addNode("NODE_INDIRA", "Indiranagar 100ft Hub", 12.9784, 77.6408);
        addNode("NODE_KORAM", "Koramangala 5th Block", 12.9352, 77.6245);
        addNode("NODE_HSR", "HSR Layout Sector 1", 12.9116, 77.6389);
        addNode("NODE_BTM", "BTM Layout 2nd Stage", 12.9166, 77.6101);
        addNode("NODE_JAYA", "Jayanagar 4th Block", 12.9299, 77.5824);
        addNode("NODE_MALLESH", "Malleshwaram 8th Cross", 13.0031, 77.5701);
        addNode("NODE_RAJAJI", "Rajajinagar Industrial Area", 12.9901, 77.5526);
        addNode("NODE_HEBBAL", "Hebbal Flyover Junction", 13.0358, 77.5970);
        addNode("NODE_YESH", "Yeshwanthpur APMC", 13.0238, 77.5501);
        addNode("NODE_BELLANDUR", "Bellandur Outer Ring Road", 12.9304, 77.6784);
        addNode("NODE_MARATHA", "Marathahalli Bridge", 12.9591, 77.6974);
        addNode("NODE_WHITEFIELD", "Whitefield ITPL Zone", 12.9856, 77.7289);
        addNode("NODE_ECITY", "Electronic City Phase 1", 12.8452, 77.6602);
        addNode("NODE_SHANTI", "Shanthi Nagar Bus Terminal", 12.9548, 77.5912);

        // Interconnecting road network edges (distance in meters, base travel time in seconds, speed in km/h)
        addEdgePair("E_DEPOT_MG", "DEPOT", "NODE_MG", 1600, 180, 35.0, "PRIMARY");
        addEdgePair("E_DEPOT_SHANTI", "DEPOT", "NODE_SHANTI", 1900, 210, 35.0, "PRIMARY");
        addEdgePair("E_DEPOT_MALLESH", "DEPOT", "NODE_MALLESH", 4200, 480, 40.0, "ARTERIAL");
        addEdgePair("E_MG_INDIRA", "NODE_MG", "NODE_INDIRA", 3600, 390, 40.0, "PRIMARY");
        addEdgePair("E_MG_KORAM", "NODE_MG", "NODE_KORAM", 4800, 540, 35.0, "PRIMARY");
        addEdgePair("E_SHANTI_JAYA", "NODE_SHANTI", "NODE_JAYA", 3100, 360, 35.0, "SECONDARY");
        addEdgePair("E_SHANTI_KORAM", "NODE_SHANTI", "NODE_KORAM", 4100, 450, 40.0, "PRIMARY");
        addEdgePair("E_KORAM_HSR", "NODE_KORAM", "NODE_HSR", 3200, 340, 40.0, "PRIMARY");
        addEdgePair("E_KORAM_BELLANDUR", "NODE_KORAM", "NODE_BELLANDUR", 5500, 580, 45.0, "ARTERIAL");
        addEdgePair("E_HSR_BTM", "NODE_HSR", "NODE_BTM", 3300, 360, 35.0, "SECONDARY");
        addEdgePair("E_BTM_JAYA", "NODE_BTM", "NODE_JAYA", 3200, 360, 35.0, "SECONDARY");
        addEdgePair("E_HSR_ECITY", "NODE_HSR", "NODE_ECITY", 8900, 800, 50.0, "HIGHWAY");
        addEdgePair("E_INDIRA_MARATHA", "NODE_INDIRA", "NODE_MARATHA", 6400, 680, 45.0, "ARTERIAL");
        addEdgePair("E_BELLANDUR_MARATHA", "NODE_BELLANDUR", "NODE_MARATHA", 3900, 400, 45.0, "ARTERIAL");
        addEdgePair("E_MARATHA_WHITEFIELD", "NODE_MARATHA", "NODE_WHITEFIELD", 4700, 510, 40.0, "PRIMARY");
        addEdgePair("E_MALLESH_HEBBAL", "NODE_MALLESH", "NODE_HEBBAL", 4500, 480, 45.0, "ARTERIAL");
        addEdgePair("E_MALLESH_RAJAJI", "NODE_MALLESH", "NODE_RAJAJI", 2400, 290, 35.0, "SECONDARY");
        addEdgePair("E_RAJAJI_YESH", "NODE_RAJAJI", "NODE_YESH", 3800, 420, 40.0, "SECONDARY");
        addEdgePair("E_HEBBAL_YESH", "NODE_HEBBAL", "NODE_YESH", 5200, 540, 50.0, "ARTERIAL");
        addEdgePair("E_RAJAJI_SHANTI", "NODE_RAJAJI", "NODE_SHANTI", 5600, 620, 35.0, "SECONDARY");

        log.info("Road network loaded with {} nodes and {} directed edges.",
                roadGraph.getAllNodes().size(), roadGraph.getAllEdges().size());
    }

    private void addNode(String id, String name, double lat, double lon) {
        roadGraph.addNode(new RoadNode(id, name, lat, lon));
    }

    private void addEdgePair(String id, String u, String v, long dist, long timeSec, double speed, String type) {
        roadGraph.addBidirectionalEdge(id, u, v, dist, timeSec, speed, type);
    }

    @Override
    public RoadGraph getRoadGraph() {
        return this.roadGraph;
    }

    @Override
    public void applyTrafficScenario(TrafficType trafficType, List<String> closedEdgeIds) {
        this.currentTrafficType = trafficType;
        this.closedEdges.clear();
        if (closedEdgeIds != null) {
            this.closedEdges.addAll(closedEdgeIds);
        }

        double multiplier = switch (trafficType) {
            case LOW -> 0.85;
            case NORMAL -> 1.0;
            case MODERATE -> 1.35;
            case HEAVY -> 1.85;
            case ROAD_CLOSURE -> 1.6;
        };

        for (RoadEdge edge : roadGraph.getAllEdges()) {
            boolean isClosed = closedEdges.contains(edge.getId()) ||
                    (trafficType == TrafficType.ROAD_CLOSURE && edge.getId().startsWith("E_DEPOT_MG"));
            edge.setOpen(!isClosed);
            edge.setTrafficMultiplier(multiplier);
        }
        log.info("Applied traffic scenario {}: multiplier={}, closedEdgesCount={}",
                trafficType, multiplier, closedEdges.size());
    }

    @Override
    public ShortestPathResult computeRouteBetweenCoordinates(double fromLat, double fromLon,
                                                             double toLat, double toLon,
                                                             RouteObjective objective) {
        RoadNode startNode = roadGraph.findNearestNode(fromLat, fromLon);
        RoadNode endNode = roadGraph.findNearestNode(toLat, toLon);

        if (startNode == null || endNode == null) {
            double straightDist = getStraightLineDistanceMeters(fromLat, fromLon, toLat, toLon);
            long time = (long) (straightDist / 8.33); // approx 30 km/h
            return new ShortestPathResult(Collections.emptyList(), Collections.emptyList(), (long) straightDist, time, true);
        }

        ShortestPathResult result = shortestPathService.findShortestPathAStar(roadGraph, startNode.getId(), endNode.getId(), objective);

        if (!result.isReachable()) {
            // Fallback to Dijkstra
            result = shortestPathService.findShortestPathDijkstra(roadGraph, startNode.getId(), endNode.getId(), objective);
        }

        // Add access distance from coordinates to nearest graph entry/exit nodes
        double accessDistFrom = RoadGraph.haversineDistanceMeters(fromLat, fromLon, startNode.getLatitude(), startNode.getLongitude());
        double accessDistTo = RoadGraph.haversineDistanceMeters(toLat, toLon, endNode.getLatitude(), endNode.getLongitude());

        long extraDist = (long) (accessDistFrom + accessDistTo);
        long extraTime = (long) (extraDist / 6.94); // 25 km/h for last-mile local access

        if (result.isReachable()) {
            result.setTotalDistanceMeters(result.getTotalDistanceMeters() + extraDist);
            result.setTotalTravelTimeSeconds(result.getTotalTravelTimeSeconds() + extraTime);
            return result;
        } else {
            // Detour or straight-line fallback with road network penalty factor 1.35
            double straightDist = getStraightLineDistanceMeters(fromLat, fromLon, toLat, toLon);
            long approxRoadDist = (long) (straightDist * 1.35);
            long approxTime = (long) (approxRoadDist / 8.33);
            return new ShortestPathResult(
                    Arrays.asList(startNode, endNode),
                    Collections.emptyList(),
                    approxRoadDist,
                    approxTime,
                    true
            );
        }
    }

    @Override
    public long getRoadDistanceMeters(double fromLat, double fromLon, double toLat, double toLon) {
        ShortestPathResult res = computeRouteBetweenCoordinates(fromLat, fromLon, toLat, toLon, RouteObjective.MINIMIZE_DISTANCE);
        return res.getTotalDistanceMeters();
    }

    @Override
    public long getTravelTimeSeconds(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective) {
        ShortestPathResult res = computeRouteBetweenCoordinates(fromLat, fromLon, toLat, toLon, objective);
        return res.getTotalTravelTimeSeconds();
    }

    @Override
    public double getStraightLineDistanceMeters(double fromLat, double fromLon, double toLat, double toLon) {
        return RoadGraph.haversineDistanceMeters(fromLat, fromLon, toLat, toLon);
    }

    @Override
    public long[][] computeTravelTimeMatrix(List<RoadNode> locations, RouteObjective objective) {
        int n = locations.size();
        long[][] matrix = new long[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    matrix[i][j] = 0;
                } else {
                    matrix[i][j] = getTravelTimeSeconds(
                            locations.get(i).getLatitude(), locations.get(i).getLongitude(),
                            locations.get(j).getLatitude(), locations.get(j).getLongitude(),
                            objective);
                }
            }
        }
        return matrix;
    }

    @Override
    public long[][] computeDistanceMatrix(List<RoadNode> locations) {
        int n = locations.size();
        long[][] matrix = new long[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    matrix[i][j] = 0;
                } else {
                    matrix[i][j] = getRoadDistanceMeters(
                            locations.get(i).getLatitude(), locations.get(i).getLongitude(),
                            locations.get(j).getLatitude(), locations.get(j).getLongitude());
                }
            }
        }
        return matrix;
    }
}
