package com.delivery.optimizer.service;

import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.model.graph.ShortestPathResult;

public interface ShortestPathService {
    ShortestPathResult findShortestPathDijkstra(RoadGraph graph, String sourceNodeId, String destinationNodeId, RouteObjective objective);
    ShortestPathResult findShortestPathAStar(RoadGraph graph, String sourceNodeId, String destinationNodeId, RouteObjective objective);
}
