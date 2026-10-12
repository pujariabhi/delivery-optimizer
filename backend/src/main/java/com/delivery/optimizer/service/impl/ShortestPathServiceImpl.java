package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.model.graph.RoadEdge;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.model.graph.RoadNode;
import com.delivery.optimizer.model.graph.ShortestPathResult;
import com.delivery.optimizer.service.ShortestPathService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ShortestPathServiceImpl implements ShortestPathService {

    private static class NodeRecord implements Comparable<NodeRecord> {
        final String nodeId;
        final double priority; // for A* this is f = g + h, for Dijkstra this is g

        NodeRecord(String nodeId, double priority) {
            this.nodeId = nodeId;
            this.priority = priority;
        }

        @Override
        public int compareTo(NodeRecord o) {
            return Double.compare(this.priority, o.priority);
        }
    }

    @Override
    public ShortestPathResult findShortestPathDijkstra(RoadGraph graph, String sourceNodeId,
                                                      String destinationNodeId, RouteObjective objective) {
        if (graph.getNode(sourceNodeId) == null || graph.getNode(destinationNodeId) == null) {
            return ShortestPathResult.unreachable();
        }

        if (sourceNodeId.equals(destinationNodeId)) {
            RoadNode node = graph.getNode(sourceNodeId);
            return new ShortestPathResult(Collections.singletonList(node), Collections.emptyList(), 0, 0, true);
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, RoadEdge> edgeTo = new HashMap<>();
        Map<String, String> prevNode = new HashMap<>();
        PriorityQueue<NodeRecord> pq = new PriorityQueue<>();

        for (RoadNode node : graph.getAllNodes()) {
            distances.put(node.getId(), Double.MAX_VALUE);
        }

        distances.put(sourceNodeId, 0.0);
        pq.add(new NodeRecord(sourceNodeId, 0.0));

        while (!pq.isEmpty()) {
            NodeRecord current = pq.poll();
            String u = current.nodeId;

            if (current.priority > distances.get(u)) {
                continue;
            }

            if (u.equals(destinationNodeId)) {
                break;
            }

            for (RoadEdge edge : graph.getOutgoingEdges(u)) {
                if (!edge.isOpen()) {
                    continue; // Skip closed roads
                }

                double weight = getEdgeWeight(edge, objective);
                double newDist = distances.get(u) + weight;
                String v = edge.getDestinationNodeId();

                if (newDist < distances.getOrDefault(v, Double.MAX_VALUE)) {
                    distances.put(v, newDist);
                    edgeTo.put(v, edge);
                    prevNode.put(v, u);
                    pq.add(new NodeRecord(v, newDist));
                }
            }
        }

        if (distances.get(destinationNodeId) >= Double.MAX_VALUE / 2) {
            return ShortestPathResult.unreachable();
        }

        return reconstructPath(graph, sourceNodeId, destinationNodeId, edgeTo, prevNode);
    }

    @Override
    public ShortestPathResult findShortestPathAStar(RoadGraph graph, String sourceNodeId,
                                                   String destinationNodeId, RouteObjective objective) {
        if (graph.getNode(sourceNodeId) == null || graph.getNode(destinationNodeId) == null) {
            return ShortestPathResult.unreachable();
        }

        if (sourceNodeId.equals(destinationNodeId)) {
            RoadNode node = graph.getNode(sourceNodeId);
            return new ShortestPathResult(Collections.singletonList(node), Collections.emptyList(), 0, 0, true);
        }

        RoadNode targetNode = graph.getNode(destinationNodeId);
        Map<String, Double> gScores = new HashMap<>();
        Map<String, Double> fScores = new HashMap<>();
        Map<String, RoadEdge> edgeTo = new HashMap<>();
        Map<String, String> prevNode = new HashMap<>();
        PriorityQueue<NodeRecord> openSet = new PriorityQueue<>();

        for (RoadNode node : graph.getAllNodes()) {
            gScores.put(node.getId(), Double.MAX_VALUE);
            fScores.put(node.getId(), Double.MAX_VALUE);
        }

        gScores.put(sourceNodeId, 0.0);
        double hStart = calculateHeuristic(graph.getNode(sourceNodeId), targetNode, objective);
        fScores.put(sourceNodeId, hStart);
        openSet.add(new NodeRecord(sourceNodeId, hStart));

        while (!openSet.isEmpty()) {
            NodeRecord current = openSet.poll();
            String u = current.nodeId;

            if (u.equals(destinationNodeId)) {
                return reconstructPath(graph, sourceNodeId, destinationNodeId, edgeTo, prevNode);
            }

            if (current.priority > fScores.get(u)) {
                continue;
            }

            for (RoadEdge edge : graph.getOutgoingEdges(u)) {
                if (!edge.isOpen()) {
                    continue;
                }

                String v = edge.getDestinationNodeId();
                double tentativeG = gScores.get(u) + getEdgeWeight(edge, objective);

                if (tentativeG < gScores.getOrDefault(v, Double.MAX_VALUE)) {
                    edgeTo.put(v, edge);
                    prevNode.put(v, u);
                    gScores.put(v, tentativeG);
                    double h = calculateHeuristic(graph.getNode(v), targetNode, objective);
                    double f = tentativeG + h;
                    fScores.put(v, f);
                    openSet.add(new NodeRecord(v, f));
                }
            }
        }

        return ShortestPathResult.unreachable();
    }

    private double getEdgeWeight(RoadEdge edge, RouteObjective objective) {
        if (objective == RouteObjective.MINIMIZE_DISTANCE) {
            return edge.getDistanceMeters();
        } else {
            // MINIMIZE_TIME or BALANCE_WORKLOAD defaults to travel time
            return edge.getEffectiveTravelTimeSeconds();
        }
    }

    private double calculateHeuristic(RoadNode from, RoadNode to, RouteObjective objective) {
        if (from == null || to == null) return 0.0;
        double straightLineMeters = RoadGraph.haversineDistanceMeters(
                from.getLatitude(), from.getLongitude(),
                to.getLatitude(), to.getLongitude());

        if (objective == RouteObjective.MINIMIZE_DISTANCE) {
            return straightLineMeters; // Admissible straight-line distance heuristic
        } else {
            // Maximum speed assumed 100 km/h = 27.78 m/s to ensure admissible (never overestimate) time
            return straightLineMeters / 27.78;
        }
    }

    private ShortestPathResult reconstructPath(RoadGraph graph, String sourceId, String targetId,
                                              Map<String, RoadEdge> edgeTo, Map<String, String> prevNode) {
        List<RoadNode> pathNodes = new ArrayList<>();
        List<RoadEdge> pathEdges = new ArrayList<>();
        long totalDist = 0;
        long totalTime = 0;

        String curr = targetId;
        while (!curr.equals(sourceId)) {
            pathNodes.add(graph.getNode(curr));
            RoadEdge edge = edgeTo.get(curr);
            if (edge != null) {
                pathEdges.add(edge);
                totalDist += edge.getDistanceMeters();
                totalTime += edge.getEffectiveTravelTimeSeconds();
            }
            curr = prevNode.get(curr);
            if (curr == null) break;
        }
        pathNodes.add(graph.getNode(sourceId));

        Collections.reverse(pathNodes);
        Collections.reverse(pathEdges);

        return new ShortestPathResult(pathNodes, pathEdges, totalDist, totalTime, true);
    }
}
