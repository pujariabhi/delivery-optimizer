package com.delivery.optimizer;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.model.graph.RoadEdge;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.model.graph.RoadNode;
import com.delivery.optimizer.model.graph.ShortestPathResult;
import com.delivery.optimizer.service.ShortestPathService;
import com.delivery.optimizer.service.impl.ShortestPathServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DijkstraAndAStarAlgorithmTest {

    private ShortestPathService shortestPathService;
    private RoadGraph testGraph;

    @BeforeEach
    void setUp() {
        shortestPathService = new ShortestPathServiceImpl();
        testGraph = new RoadGraph();

        // 5 nodes on a test grid
        testGraph.addNode(new RoadNode("A", "Depot", 12.9716, 77.5946));
        testGraph.addNode(new RoadNode("B", "Junction North", 12.9800, 77.5946));
        testGraph.addNode(new RoadNode("C", "Junction East", 12.9716, 77.6100));
        testGraph.addNode(new RoadNode("D", "Midpoint", 12.9800, 77.6100));
        testGraph.addNode(new RoadNode("E", "Destination", 12.9900, 77.6200));

        // Path 1 via B: A -> B (1000m, 120s), B -> D (1500m, 180s), D -> E (1200m, 140s) = 3700m, 440s
        testGraph.addBidirectionalEdge("E_AB", "A", "B", 1000, 120, 30.0, "PRIMARY");
        testGraph.addBidirectionalEdge("E_BD", "B", "D", 1500, 180, 30.0, "PRIMARY");
        testGraph.addBidirectionalEdge("E_DE", "D", "E", 1200, 140, 30.0, "PRIMARY");

        // Path 2 via C (shorter travel time but longer distance): A -> C (2000m, 150s), C -> E (1500m, 150s) = 3500m, 300s
        testGraph.addBidirectionalEdge("E_AC", "A", "C", 2000, 150, 48.0, "HIGHWAY");
        testGraph.addBidirectionalEdge("E_CE", "C", "E", 1500, 150, 48.0, "HIGHWAY");
    }

    @Test
    @DisplayName("Dijkstra finds shortest path by travel time")
    void testDijkstraFindsFastestPath() {
        ShortestPathResult result = shortestPathService.findShortestPathDijkstra(
                testGraph, "A", "E", RouteObjective.MINIMIZE_TIME);

        assertTrue(result.isReachable(), "Target node E should be reachable");
        assertEquals(300, result.getTotalTravelTimeSeconds(), "Fastest path travel time should be 300 seconds");
        assertEquals(3500, result.getTotalDistanceMeters(), "Distance of fastest path should be 3500m");
        assertEquals(3, result.getPathNodes().size(), "Path should visit A -> C -> E");
        assertEquals("C", result.getPathNodes().get(1).getId());
    }

    @Test
    @DisplayName("A* finds shortest path with admissible heuristic")
    void testAStarFindsPath() {
        ShortestPathResult result = shortestPathService.findShortestPathAStar(
                testGraph, "A", "E", RouteObjective.MINIMIZE_TIME);

        assertTrue(result.isReachable());
        assertEquals(300, result.getTotalTravelTimeSeconds());
        assertEquals("E", result.getPathNodes().get(result.getPathNodes().size() - 1).getId());
    }

    @Test
    @DisplayName("Road closure redirects through alternative route")
    void testRoadClosureReroutes() {
        // Close edge A -> C
        for (RoadEdge edge : testGraph.getOutgoingEdges("A")) {
            if ("C".equals(edge.getDestinationNodeId())) {
                edge.setOpen(false);
            }
        }

        ShortestPathResult result = shortestPathService.findShortestPathDijkstra(
                testGraph, "A", "E", RouteObjective.MINIMIZE_TIME);

        assertTrue(result.isReachable());
        assertEquals(440, result.getTotalTravelTimeSeconds(), "Should reroute via B -> D -> E in 440s");
        assertEquals("B", result.getPathNodes().get(1).getId());
    }

    @Test
    @DisplayName("Unreachable destination returns unreachable result")
    void testUnreachableNode() {
        testGraph.addNode(new RoadNode("ISOLATED", "Island", 13.5, 78.0));
        ShortestPathResult result = shortestPathService.findShortestPathDijkstra(
                testGraph, "A", "ISOLATED", RouteObjective.MINIMIZE_TIME);

        assertFalse(result.isReachable());
    }
}
