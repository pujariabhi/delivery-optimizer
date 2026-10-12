package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.CoordinateDto;
import com.delivery.optimizer.dto.VehicleLiveStatusDto;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.model.graph.RoadGraph;
import com.delivery.optimizer.repository.*;
import com.delivery.optimizer.service.RoutingService;
import com.delivery.optimizer.service.SimulationService;
import com.delivery.optimizer.service.TravelTimeService;
import com.delivery.optimizer.service.WebSocketEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SimulationServiceImpl implements SimulationService {

    private static final Logger log = LoggerFactory.getLogger(SimulationServiceImpl.class);

    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final RoutePlanRepository routePlanRepository;
    private final RouteStopRepository routeStopRepository;
    private final VehicleLocationRepository vehicleLocationRepository;
    private final RoutingService routingService;
    private final TravelTimeService travelTimeService;
    private final WebSocketEventService webSocketEventService;

    @Value("${app.simulation.default-speed-kmh:40.0}")
    private double defaultSpeedKmh;

    @Value("${app.osm.depot.latitude:12.9716}")
    private double depotLat;

    @Value("${app.osm.depot.longitude:77.5946}")
    private double depotLon;

    private volatile boolean running = false;
    private volatile double speedMultiplier = 1.0;

    private static class SimTrack {
        Long vehicleId;
        List<CoordinateDto> path = new ArrayList<>();
        int pathIndex = 0;
        double currentHeading = 0.0;
        List<RouteStop> assignedStops = new ArrayList<>();
    }

    private final Map<Long, SimTrack> activeTracks = new ConcurrentHashMap<>();

    public SimulationServiceImpl(VehicleRepository vehicleRepository,
                                 DeliveryOrderRepository orderRepository,
                                 RoutePlanRepository routePlanRepository,
                                 RouteStopRepository routeStopRepository,
                                 VehicleLocationRepository vehicleLocationRepository,
                                 RoutingService routingService,
                                 TravelTimeService travelTimeService,
                                 WebSocketEventService webSocketEventService) {
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        this.routePlanRepository = routePlanRepository;
        this.routeStopRepository = routeStopRepository;
        this.vehicleLocationRepository = vehicleLocationRepository;
        this.routingService = routingService;
        this.travelTimeService = travelTimeService;
        this.webSocketEventService = webSocketEventService;
    }

    @Override
    public synchronized void startSimulation() {
        this.running = true;
        rebuildTracksFromDatabase();
        log.info("Vehicle simulation started with {} active tracks at speed {}x", activeTracks.size(), speedMultiplier);
    }

    @Override
    public synchronized void stopSimulation() {
        this.running = false;
        log.info("Vehicle simulation paused.");
    }

    @Override
    public boolean isRunning() {
        return this.running;
    }

    @Override
    public void setSimulationSpeed(double speed) {
        this.speedMultiplier = Math.max(0.2, Math.min(5.0, speed));
        log.info("Simulation speed updated to {}x", this.speedMultiplier);
    }

    @Override
    public double getSimulationSpeed() {
        return this.speedMultiplier;
    }

    @Override
    public List<VehicleLiveStatusDto> getLiveVehicleStatuses() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<VehicleLiveStatusDto> statuses = new ArrayList<>();

        for (Vehicle v : vehicles) {
            statuses.add(buildLiveStatusDto(v));
        }
        return statuses;
    }

    @Scheduled(fixedRateString = "${app.simulation.interval-ms:2000}")
    @Transactional
    public void simulationTick() {
        if (!running) {
            return;
        }

        if (activeTracks.isEmpty()) {
            rebuildTracksFromDatabase();
            if (activeTracks.isEmpty()) return;
        }

        List<VehicleLiveStatusDto> broadcastList = new ArrayList<>();

        for (SimTrack track : activeTracks.values()) {
            if (track.path.isEmpty()) continue;

            int stepIncrement = Math.max(1, (int) Math.round(speedMultiplier * 2));
            track.pathIndex = (track.pathIndex + stepIncrement) % track.path.size();

            CoordinateDto currentPos = track.path.get(track.pathIndex);
            CoordinateDto nextPos = track.path.get((track.pathIndex + 1) % track.path.size());

            track.currentHeading = calculateBearing(
                    currentPos.getLatitude(), currentPos.getLongitude(),
                    nextPos.getLatitude(), nextPos.getLongitude());

            Vehicle vehicle = vehicleRepository.findById(track.vehicleId).orElse(null);
            if (vehicle == null) continue;

            vehicle.setCurrentLatitude(BigDecimal.valueOf(currentPos.getLatitude()));
            vehicle.setCurrentLongitude(BigDecimal.valueOf(currentPos.getLongitude()));
            vehicleRepository.save(vehicle);

            // Persist location history entry (marked as SIMULATED)
            VehicleLocation loc = new VehicleLocation(
                    vehicle,
                    BigDecimal.valueOf(currentPos.getLatitude()),
                    BigDecimal.valueOf(currentPos.getLongitude()),
                    LocalDateTime.now(),
                    LocationSource.SIMULATED
            );
            vehicleLocationRepository.save(loc);

            // Check if vehicle has reached any assigned pending stop
            checkStopProximityAndDeliver(track, currentPos, vehicle);

            VehicleLiveStatusDto statusDto = buildLiveStatusDto(vehicle);
            statusDto.setHeadingDegrees(track.currentHeading);
            broadcastList.add(statusDto);
        }

        if (!broadcastList.isEmpty()) {
            webSocketEventService.broadcastVehicleLocation(broadcastList);
        }
    }

    private void checkStopProximityAndDeliver(SimTrack track, CoordinateDto currentPos, Vehicle vehicle) {
        for (RouteStop stop : track.assignedStops) {
            if (stop.getStatus() == StopStatus.PENDING) {
                DeliveryOrder order = stop.getOrder();
                double dist = RoadGraph.haversineDistanceMeters(
                        currentPos.getLatitude(), currentPos.getLongitude(),
                        order.getLatitude().doubleValue(), order.getLongitude().doubleValue());

                if (dist < 120.0) { // Reached within 120 meters of customer address
                    stop.setStatus(StopStatus.DELIVERED);
                    stop.setActualArrivalTime(LocalDateTime.now());
                    routeStopRepository.save(stop);

                    order.setStatus(OrderStatus.DELIVERED);
                    orderRepository.save(order);

                    log.info("Simulated vehicle {} arrived at stop #{} for order {}",
                            vehicle.getRegistrationNumber(), stop.getStopSequence(), order.getOrderNumber());

                    webSocketEventService.broadcastOrderUpdate(
                            "Order " + order.getOrderNumber() + " delivered by " + vehicle.getDriverName());
                }
            }
        }
    }

    private synchronized void rebuildTracksFromDatabase() {
        activeTracks.clear();
        Optional<RoutePlan> activePlanOpt = routePlanRepository.findFirstByStatusOrderByCreatedAtDesc(RouteStatus.ACTIVE);
        if (activePlanOpt.isEmpty()) {
            activePlanOpt = routePlanRepository.findFirstByOrderByCreatedAtDesc();
        }

        if (activePlanOpt.isEmpty()) {
            return;
        }

        RoutePlan plan = activePlanOpt.get();
        List<RouteStop> stops = routeStopRepository.findStopsWithDetails(plan.getId());

        Map<Long, List<RouteStop>> vehicleStopsMap = new HashMap<>();
        for (RouteStop s : stops) {
            vehicleStopsMap.computeIfAbsent(s.getVehicle().getId(), k -> new ArrayList<>()).add(s);
        }

        for (Map.Entry<Long, List<RouteStop>> entry : vehicleStopsMap.entrySet()) {
            Long vId = entry.getKey();
            List<RouteStop> vStops = entry.getValue();
            vStops.sort(Comparator.comparingInt(RouteStop::getStopSequence));

            Vehicle vehicle = vehicleRepository.findById(vId).orElse(null);
            if (vehicle == null) continue;

            SimTrack track = new SimTrack();
            track.vehicleId = vId;
            track.assignedStops = vStops;

            double currLat = vehicle.getCurrentLatitude().doubleValue();
            double currLon = vehicle.getCurrentLongitude().doubleValue();

            for (RouteStop s : vStops) {
                double targetLat = s.getOrder().getLatitude().doubleValue();
                double targetLon = s.getOrder().getLongitude().doubleValue();
                List<CoordinateDto> leg = routingService.getRoutePolyline(currLat, currLon, targetLat, targetLon, plan.getOptimizationObjective());
                track.path.addAll(leg);
                currLat = targetLat;
                currLon = targetLon;
            }

            // Return leg back to depot
            track.path.addAll(routingService.getRoutePolyline(currLat, currLon, depotLat, depotLon, plan.getOptimizationObjective()));

            if (!track.path.isEmpty()) {
                activeTracks.put(vId, track);
            }
        }
    }

    private VehicleLiveStatusDto buildLiveStatusDto(Vehicle v) {
        VehicleLiveStatusDto dto = new VehicleLiveStatusDto();
        dto.setVehicleId(v.getId());
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setDriverName(v.getDriverName());
        dto.setVehicleType(v.getVehicleType().name());
        dto.setStatus(v.getStatus());
        dto.setLatitude(v.getCurrentLatitude().doubleValue());
        dto.setLongitude(v.getCurrentLongitude().doubleValue());
        dto.setSpeedKmh(running && v.getStatus() == VehicleStatus.ON_DELIVERY ? defaultSpeedKmh * speedMultiplier : 0.0);
        dto.setSourceType(LocationSource.SIMULATED);
        dto.setLastPingTime(LocalDateTime.now());

        SimTrack track = activeTracks.get(v.getId());
        if (track != null) {
            dto.setHeadingDegrees(track.currentHeading);
            RouteStop nextPendingStop = track.assignedStops.stream()
                    .filter(s -> s.getStatus() == StopStatus.PENDING)
                    .findFirst()
                    .orElse(null);

            if (nextPendingStop != null) {
                dto.setNextStopAddress(nextPendingStop.getOrder().getDeliveryAddress());
                dto.setNextStopCustomer(nextPendingStop.getOrder().getCustomerName());
                dto.setEstimatedArrivalTime(nextPendingStop.getEstimatedArrivalTime());
                long remainingCount = track.assignedStops.stream().filter(s -> s.getStatus() == StopStatus.PENDING).count();
                dto.setRemainingStopsCount((int) remainingCount);

                long remainingMeters = (long) ((track.path.size() - track.pathIndex) * 45.0);
                dto.setRemainingDistanceMeters(Math.max(200, remainingMeters));
            } else {
                dto.setNextStopAddress("Returning to Depot (Central Hub)");
                dto.setRemainingStopsCount(0);
                dto.setRemainingDistanceMeters(0);
            }
        }

        return dto;
    }

    private double calculateBearing(double lat1, double lon1, double lat2, double lon2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double y = Math.sin(deltaLambda) * Math.cos(phi2);
        double x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        double bearingRad = Math.atan2(y, x);

        return (Math.toDegrees(bearingRad) + 360.0) % 360.0;
    }
}
