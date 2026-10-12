package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.CoordinateDto;
import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.model.graph.RoadNode;
import com.delivery.optimizer.model.graph.ShortestPathResult;
import com.delivery.optimizer.service.RoutingService;
import com.delivery.optimizer.service.TravelTimeService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoutingServiceImpl implements RoutingService {

    private final TravelTimeService travelTimeService;

    public RoutingServiceImpl(TravelTimeService travelTimeService) {
        this.travelTimeService = travelTimeService;
    }

    @Override
    public List<CoordinateDto> getRoutePolyline(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective) {
        ShortestPathResult result = travelTimeService.computeRouteBetweenCoordinates(fromLat, fromLon, toLat, toLon, objective);
        List<CoordinateDto> polyline = new ArrayList<>();

        polyline.add(new CoordinateDto(fromLat, fromLon));

        if (result.getPathNodes() != null && !result.getPathNodes().isEmpty()) {
            for (RoadNode node : result.getPathNodes()) {
                polyline.add(new CoordinateDto(node.getLatitude(), node.getLongitude()));
            }
        }

        polyline.add(new CoordinateDto(toLat, toLon));

        // Smooth polyline by interpolating fine intermediate steps
        return interpolatePolyline(polyline, 5);
    }

    @Override
    public ShortestPathResult getRouteDetails(double fromLat, double fromLon, double toLat, double toLon, RouteObjective objective) {
        return travelTimeService.computeRouteBetweenCoordinates(fromLat, fromLon, toLat, toLon, objective);
    }

    private List<CoordinateDto> interpolatePolyline(List<CoordinateDto> rawPoints, int stepsPerSegment) {
        if (rawPoints.size() < 2) return rawPoints;

        List<CoordinateDto> smoothed = new ArrayList<>();
        for (int i = 0; i < rawPoints.size() - 1; i++) {
            CoordinateDto p1 = rawPoints.get(i);
            CoordinateDto p2 = rawPoints.get(i + 1);

            for (int s = 0; s < stepsPerSegment; s++) {
                double fraction = (double) s / stepsPerSegment;
                double lat = p1.getLatitude() + fraction * (p2.getLatitude() - p1.getLatitude());
                double lon = p1.getLongitude() + fraction * (p2.getLongitude() - p1.getLongitude());
                smoothed.add(new CoordinateDto(lat, lon));
            }
        }
        smoothed.add(rawPoints.get(rawPoints.size() - 1));
        return smoothed;
    }
}
