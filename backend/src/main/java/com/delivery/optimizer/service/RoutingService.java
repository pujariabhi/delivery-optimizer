package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.CoordinateDto;
import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.model.graph.ShortestPathResult;

import java.util.List;

public interface RoutingService {
    List<CoordinateDto> getRoutePolyline(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective);
    ShortestPathResult getRouteDetails(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective);
}
