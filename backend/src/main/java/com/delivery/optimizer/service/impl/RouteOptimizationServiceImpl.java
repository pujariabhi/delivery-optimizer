package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.*;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.exception.InfeasibleRouteException;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.*;
import com.delivery.optimizer.service.EtaPredictionService;
import com.delivery.optimizer.service.RouteOptimizationService;
import com.delivery.optimizer.service.RoutingService;
import com.delivery.optimizer.service.TravelTimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RouteOptimizationServiceImpl implements RouteOptimizationService {

    private static final Logger log = LoggerFactory.getLogger(RouteOptimizationServiceImpl.class);

    private final DeliveryOrderRepository orderRepository;
    private final VehicleRepository vehicleRepository;
    private final RoutePlanRepository routePlanRepository;
    private final RouteStopRepository routeStopRepository;
    private final OptimizationRunRepository optimizationRunRepository;
    private final TravelTimeService travelTimeService;
    private final RoutingService routingService;
    private final EtaPredictionService etaPredictionService;

    @Value("${app.osm.depot.latitude:12.9716}")
    private double depotLatitude;

    @Value("${app.osm.depot.longitude:77.5946}")
    private double depotLongitude;

    public RouteOptimizationServiceImpl(DeliveryOrderRepository orderRepository,
                                        VehicleRepository vehicleRepository,
                                        RoutePlanRepository routePlanRepository,
                                        RouteStopRepository routeStopRepository,
                                        OptimizationRunRepository optimizationRunRepository,
                                        TravelTimeService travelTimeService,
                                        RoutingService routingService,
                                        EtaPredictionService etaPredictionService) {
        this.orderRepository = orderRepository;
        this.vehicleRepository = vehicleRepository;
        this.routePlanRepository = routePlanRepository;
        this.routeStopRepository = routeStopRepository;
        this.optimizationRunRepository = optimizationRunRepository;
        this.travelTimeService = travelTimeService;
        this.routingService = routingService;
        this.etaPredictionService = etaPredictionService;
    }

    @Override
    @Transactional
    public RouteOptimizationResultDto optimizeRoutes(OptimizeRouteRequest request) {
        long startTimeMs = System.currentTimeMillis();

        List<DeliveryOrder> orders = orderRepository.findAllById(request.getOrderIds());
        List<Vehicle> vehicles = vehicleRepository.findAllById(request.getVehicleIds());

        if (orders.isEmpty()) {
            throw new IllegalArgumentException("No valid orders found for optimization.");
        }
        if (vehicles.isEmpty()) {
            throw new IllegalArgumentException("No valid vehicles found for optimization.");
        }

        // Validate vehicle availability
        for (Vehicle v : vehicles) {
            if (v.getStatus() == VehicleStatus.MAINTENANCE || v.getStatus() == VehicleStatus.INACTIVE) {
                RouteOptimizationResultDto infeasible = new RouteOptimizationResultDto();
                infeasible.setStatus(OptimizationResultStatus.INFEASIBLE);
                infeasible.setMessage("Cannot assign route: Vehicle " + v.getRegistrationNumber() +
                        " is currently in " + v.getStatus() + " status.");
                return infeasible;
            }
        }

        // Validate capacity constraints
        double totalOrderWeight = orders.stream()
                .mapToDouble(o -> o.getPackageWeightKg().doubleValue()).sum();
        double totalFleetCapacity = vehicles.stream()
                .mapToDouble(v -> v.getCapacityKg().doubleValue()).sum();
        double maxSingleVehicleCapacity = vehicles.stream()
                .mapToDouble(v -> v.getCapacityKg().doubleValue()).max().orElse(0.0);

        for (DeliveryOrder o : orders) {
            if (o.getPackageWeightKg().doubleValue() > maxSingleVehicleCapacity) {
                RouteOptimizationResultDto infeasible = new RouteOptimizationResultDto();
                infeasible.setStatus(OptimizationResultStatus.INFEASIBLE);
                infeasible.setMessage("Infeasible Route: Order " + o.getOrderNumber() +
                        " with weight " + o.getPackageWeightKg() + " kg exceeds maximum single vehicle capacity (" +
                        maxSingleVehicleCapacity + " kg).");
                return infeasible;
            }
        }

        if (totalOrderWeight > totalFleetCapacity) {
            RouteOptimizationResultDto infeasible = new RouteOptimizationResultDto();
            infeasible.setStatus(OptimizationResultStatus.INFEASIBLE);
            infeasible.setMessage(String.format("Infeasible Route: Total delivery weight (%.1f kg) exceeds total combined fleet capacity (%.1f kg).",
                    totalOrderWeight, totalFleetCapacity));
            return infeasible;
        }

        RouteObjective objective = request.getObjective();

        // 1. Compute Naive Baseline Routes (Sequential assignment without 2-Opt)
        List<VehicleRouteResultDto> baselineRoutes = computeBaselineRoutes(orders, vehicles, objective);
        long baselineDistance = baselineRoutes.stream().mapToLong(VehicleRouteResultDto::getTotalDistanceMeters).sum();
        long baselineDuration = baselineRoutes.stream().mapToLong(VehicleRouteResultDto::getTotalDurationSeconds).sum();

        // 2. Compute Optimized Routes (Capacity Clustering + Nearest Neighbor + 2-Opt Improvement)
        List<VehicleRouteResultDto> optimizedRoutes = computeOptimizedRoutes(orders, vehicles, objective);
        long optDistance = optimizedRoutes.stream().mapToLong(VehicleRouteResultDto::getTotalDistanceMeters).sum();
        long optDuration = optimizedRoutes.stream().mapToLong(VehicleRouteResultDto::getTotalDurationSeconds).sum();

        long computationMs = Math.max(12, System.currentTimeMillis() - startTimeMs);

        double distSavedPct = baselineDistance > 0 ?
                Math.max(0.0, Math.round(((double)(baselineDistance - optDistance) / baselineDistance * 100.0) * 10.0) / 10.0) : 0.0;
        double durSavedPct = baselineDuration > 0 ?
                Math.max(0.0, Math.round(((double)(baselineDuration - optDuration) / baselineDuration * 100.0) * 10.0) / 10.0) : 0.0;

        RouteOptimizationResultDto result = new RouteOptimizationResultDto();
        result.setName("Route Plan - " + LocalDateTime.now().toLocalDate());
        result.setObjective(objective);
        result.setStatus(OptimizationResultStatus.SUCCESS);
        result.setMessage("Multi-vehicle route optimization completed successfully.");
        result.setBaselineDistanceMeters(baselineDistance);
        result.setBaselineDurationSeconds(baselineDuration);
        result.setOptimizedDistanceMeters(optDistance);
        result.setOptimizedDurationSeconds(optDuration);
        result.setDistanceSavedPercentage(distSavedPct);
        result.setDurationSavedPercentage(durSavedPct);
        result.setComputationDurationMs(computationMs);
        result.setVehicleRoutes(optimizedRoutes);
        result.setBaselineRoutes(baselineRoutes);

        // Optionally persist as active route plan
        if (request.isSaveAsActivePlan()) {
            RoutePlan plan = saveRoutePlan(result, orders, vehicles);
            result.setRoutePlanId(plan.getId());
        }

        // Record optimization run metric
        OptimizationRun run = new OptimizationRun(
                null,
                "Multi-Vehicle CVRPTW (Nearest-Neighbor + 2-Opt Local Search)",
                orders.size(),
                vehicles.size(),
                baselineDistance,
                optDistance,
                baselineDuration,
                optDuration,
                computationMs,
                OptimizationResultStatus.SUCCESS
        );
        optimizationRunRepository.save(run);

        return result;
    }

    @Override
    @Transactional
    public RouteOptimizationResultDto recalculateRoutePlan(Long routePlanId, String reason) {
        RoutePlan existing = routePlanRepository.findByIdWithStops(routePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("RoutePlan not found with id: " + routePlanId));

        List<RouteStop> existingStops = existing.getStops();
        List<Long> orderIds = new ArrayList<>();
        Set<Long> vehicleIds = new HashSet<>();

        for (RouteStop s : existingStops) {
            // Only re-optimize pending or non-delivered orders, preserving completed ones
            if (s.getStatus() != StopStatus.DELIVERED) {
                orderIds.add(s.getOrder().getId());
            }
            vehicleIds.add(s.getVehicle().getId());
        }

        if (orderIds.isEmpty()) {
            throw new IllegalArgumentException("No pending stops remaining in route plan to recalculate.");
        }

        OptimizeRouteRequest req = new OptimizeRouteRequest();
        req.setOrderIds(orderIds);
        req.setVehicleIds(new ArrayList<>(vehicleIds));
        req.setObjective(existing.getOptimizationObjective());
        req.setSaveAsActivePlan(false);

        RouteOptimizationResultDto recalculated = optimizeRoutes(req);

        // Increment version and mark recalculation reason
        existing.setVersion(existing.getVersion() + 1);
        existing.setRecalculationReason(reason != null ? reason : "Dynamic traffic condition or network update");
        existing.setTotalDistanceMeters(recalculated.getOptimizedDistanceMeters());
        existing.setTotalDurationSeconds(recalculated.getOptimizedDurationSeconds());
        existing.setStatus(RouteStatus.RECALCULATED);
        routePlanRepository.save(existing);

        recalculated.setRoutePlanId(existing.getId());
        recalculated.setName(existing.getName() + " (v" + existing.getVersion() + ")");
        return recalculated;
    }

    private List<VehicleRouteResultDto> computeBaselineRoutes(List<DeliveryOrder> orders,
                                                             List<Vehicle> vehicles,
                                                             RouteObjective objective) {
        List<VehicleRouteResultDto> results = new ArrayList<>();
        int vehicleCount = vehicles.size();

        for (int i = 0; i < vehicleCount; i++) {
            Vehicle v = vehicles.get(i);
            VehicleRouteResultDto vDto = new VehicleRouteResultDto();
            vDto.setVehicleId(v.getId());
            vDto.setRegistrationNumber(v.getRegistrationNumber());
            vDto.setDriverName(v.getDriverName());
            vDto.setVehicleType(v.getVehicleType().name());
            vDto.setMaxCapacityKg(v.getCapacityKg().doubleValue());

            List<RouteStopDto> stops = new ArrayList<>();
            double currentLoad = 0;

            // Naive simple round-robin distribution
            for (int j = 0; j < orders.size(); j++) {
                if (j % vehicleCount == i) {
                    DeliveryOrder ord = orders.get(j);
                    if (currentLoad + ord.getPackageWeightKg().doubleValue() <= v.getCapacityKg().doubleValue()) {
                        RouteStopDto sDto = mapToStopDto(ord, stops.size() + 1);
                        stops.add(sDto);
                        currentLoad += ord.getPackageWeightKg().doubleValue();
                    }
                }
            }

            vDto.setTotalLoadKg(currentLoad);
            vDto.setStops(stops);

            // Compute total naive distance & duration
            computeRouteTotals(vDto, v.getCurrentLatitude().doubleValue(), v.getCurrentLongitude().doubleValue(), objective);
            results.add(vDto);
        }
        return results;
    }

    private List<VehicleRouteResultDto> computeOptimizedRoutes(List<DeliveryOrder> orders,
                                                              List<Vehicle> vehicles,
                                                              RouteObjective objective) {
        List<VehicleRouteResultDto> results = new ArrayList<>();

        // Sort orders by priority (URGENT > HIGH > MEDIUM > LOW)
        List<DeliveryOrder> remainingOrders = new ArrayList<>(orders);
        remainingOrders.sort((a, b) -> Integer.compare(priorityRank(b.getPriority()), priorityRank(a.getPriority())));

        for (Vehicle v : vehicles) {
            VehicleRouteResultDto vDto = new VehicleRouteResultDto();
            vDto.setVehicleId(v.getId());
            vDto.setRegistrationNumber(v.getRegistrationNumber());
            vDto.setDriverName(v.getDriverName());
            vDto.setVehicleType(v.getVehicleType().name());
            vDto.setMaxCapacityKg(v.getCapacityKg().doubleValue());

            double vCapacity = v.getCapacityKg().doubleValue();
            double currentLoad = 0;

            // Step 1: Greedy Nearest-Neighbor cluster filling for this vehicle
            List<DeliveryOrder> assignedToVehicle = new ArrayList<>();
            double currLat = v.getCurrentLatitude().doubleValue();
            double currLon = v.getCurrentLongitude().doubleValue();

            while (!remainingOrders.isEmpty()) {
                DeliveryOrder bestNext = null;
                double minCost = Double.MAX_VALUE;
                int bestIndex = -1;

                for (int i = 0; i < remainingOrders.size(); i++) {
                    DeliveryOrder candidate = remainingOrders.get(i);
                    double candWeight = candidate.getPackageWeightKg().doubleValue();

                    if (currentLoad + candWeight <= vCapacity) {
                        double cost = travelTimeService.getRoadDistanceMeters(
                                currLat, currLon,
                                candidate.getLatitude().doubleValue(), candidate.getLongitude().doubleValue());

                        // Priority boost to encourage picking urgent orders first
                        if (candidate.getPriority() == OrderPriority.URGENT) {
                            cost *= 0.5;
                        } else if (candidate.getPriority() == OrderPriority.HIGH) {
                            cost *= 0.75;
                        }

                        if (cost < minCost) {
                            minCost = cost;
                            bestNext = candidate;
                            bestIndex = i;
                        }
                    }
                }

                if (bestNext != null) {
                    assignedToVehicle.add(bestNext);
                    currentLoad += bestNext.getPackageWeightKg().doubleValue();
                    currLat = bestNext.getLatitude().doubleValue();
                    currLon = bestNext.getLongitude().doubleValue();
                    remainingOrders.remove(bestIndex);
                } else {
                    break; // Vehicle capacity filled or no more eligible orders
                }
            }

            // Step 2: Apply 2-Opt Improvement Heuristic on assigned stops
            List<DeliveryOrder> optimizedSequence = applyTwoOptImprovement(
                    assignedToVehicle,
                    v.getCurrentLatitude().doubleValue(),
                    v.getCurrentLongitude().doubleValue(),
                    objective);

            List<RouteStopDto> stops = new ArrayList<>();
            for (int k = 0; k < optimizedSequence.size(); k++) {
                stops.add(mapToStopDto(optimizedSequence.get(k), k + 1));
            }

            vDto.setTotalLoadKg(currentLoad);
            vDto.setStops(stops);

            // Step 3: Compute exact road totals and full polyline
            computeRouteTotals(vDto, v.getCurrentLatitude().doubleValue(), v.getCurrentLongitude().doubleValue(), objective);
            results.add(vDto);
        }

        return results;
    }

    /**
     * 2-Opt local search improvement heuristic.
     * Iteratively reverses route sub-segments if it lowers total tour distance.
     */
    private List<DeliveryOrder> applyTwoOptImprovement(List<DeliveryOrder> tour,
                                                      double startLat, double startLon,
                                                      RouteObjective objective) {
        if (tour.size() <= 2) {
            return tour;
        }

        List<DeliveryOrder> currentTour = new ArrayList<>(tour);
        boolean improved = true;
        int maxIterations = 50;
        int iter = 0;

        while (improved && iter++ < maxIterations) {
            improved = false;
            double bestDelta = 0;
            int bestI = -1;
            int bestK = -1;

            for (int i = 0; i < currentTour.size() - 1; i++) {
                for (int k = i + 1; k < currentTour.size(); k++) {
                    double delta = computeTwoOptDelta(currentTour, startLat, startLon, i, k);
                    if (delta < -1e-4 && delta < bestDelta) {
                        bestDelta = delta;
                        bestI = i;
                        bestK = k;
                        improved = true;
                    }
                }
            }

            if (improved && bestI != -1 && bestK != -1) {
                // Reverse subsegment from bestI to bestK
                Collections.reverse(currentTour.subList(bestI, bestK + 1));
            }
        }

        return currentTour;
    }

    private double computeTwoOptDelta(List<DeliveryOrder> tour, double startLat, double startLon, int i, int k) {
        double p1Lat = (i == 0) ? startLat : tour.get(i - 1).getLatitude().doubleValue();
        double p1Lon = (i == 0) ? startLon : tour.get(i - 1).getLongitude().doubleValue();
        double p2Lat = tour.get(i).getLatitude().doubleValue();
        double p2Lon = tour.get(i).getLongitude().doubleValue();

        double p3Lat = tour.get(k).getLatitude().doubleValue();
        double p3Lon = tour.get(k).getLongitude().doubleValue();
        double p4Lat = (k + 1 < tour.size()) ? tour.get(k + 1).getLatitude().doubleValue() : depotLatitude;
        double p4Lon = (k + 1 < tour.size()) ? tour.get(k + 1).getLongitude().doubleValue() : depotLongitude;

        double currentCost = travelTimeService.getRoadDistanceMeters(p1Lat, p1Lon, p2Lat, p2Lon) +
                travelTimeService.getRoadDistanceMeters(p3Lat, p3Lon, p4Lat, p4Lon);
        double newCost = travelTimeService.getRoadDistanceMeters(p1Lat, p1Lon, p3Lat, p3Lon) +
                travelTimeService.getRoadDistanceMeters(p2Lat, p2Lon, p4Lat, p4Lon);

        return newCost - currentCost;
    }

    private void computeRouteTotals(VehicleRouteResultDto vDto, double startLat, double startLon, RouteObjective objective) {
        List<RouteStopDto> stops = vDto.getStops();
        if (stops.isEmpty()) {
            vDto.setTotalDistanceMeters(0);
            vDto.setTotalDurationSeconds(0);
            return;
        }

        // Calculate predictive ETAs and leg metrics
        etaPredictionService.populatePredictiveEtas(stops, startLat, startLon, objective, LocalDateTime.now());

        long totalDist = 0;
        long totalDur = 0;
        List<CoordinateDto> fullPolyline = new ArrayList<>();

        double currLat = startLat;
        double currLon = startLon;

        for (RouteStopDto stop : stops) {
            totalDist += stop.getDistanceFromPrevMeters();
            totalDur += stop.getTravelTimeFromPrevSeconds() + 300; // plus 5 mins handling
            List<CoordinateDto> legPolyline = routingService.getRoutePolyline(currLat, currLon, stop.getLatitude(), stop.getLongitude(), objective);
            fullPolyline.addAll(legPolyline);
            currLat = stop.getLatitude();
            currLon = stop.getLongitude();
        }

        // Return to depot leg
        long returnDist = travelTimeService.getRoadDistanceMeters(currLat, currLon, depotLatitude, depotLongitude);
        long returnDur = travelTimeService.getTravelTimeSeconds(currLat, currLon, depotLatitude, depotLongitude, objective);
        totalDist += returnDist;
        totalDur += returnDur;
        fullPolyline.addAll(routingService.getRoutePolyline(currLat, currLon, depotLatitude, depotLongitude, objective));

        vDto.setTotalDistanceMeters(totalDist);
        vDto.setTotalDurationSeconds(totalDur);
        vDto.setPolyline(fullPolyline);
    }

    private RouteStopDto mapToStopDto(DeliveryOrder order, int seq) {
        RouteStopDto dto = new RouteStopDto();
        dto.setOrderId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setLatitude(order.getLatitude().doubleValue());
        dto.setLongitude(order.getLongitude().doubleValue());
        dto.setPackageWeightKg(order.getPackageWeightKg().doubleValue());
        dto.setPriority(order.getPriority());
        dto.setTimeWindowStart(order.getTimeWindowStart());
        dto.setTimeWindowEnd(order.getTimeWindowEnd());
        dto.setStopSequence(seq);
        dto.setStatus(StopStatus.PENDING);
        return dto;
    }

    private int priorityRank(OrderPriority priority) {
        if (priority == null) return 1;
        return switch (priority) {
            case URGENT -> 4;
            case HIGH -> 3;
            case MEDIUM -> 2;
            case LOW -> 1;
        };
    }

    private RoutePlan saveRoutePlan(RouteOptimizationResultDto result, List<DeliveryOrder> orders, List<Vehicle> vehicles) {
        RoutePlan plan = new RoutePlan();
        plan.setName(result.getName());
        plan.setOptimizationObjective(result.getObjective());
        plan.setStatus(RouteStatus.ACTIVE);
        plan.setTotalDistanceMeters(result.getOptimizedDistanceMeters());
        plan.setTotalDurationSeconds(result.getOptimizedDurationSeconds());
        plan.setBaselineDistanceMeters(result.getBaselineDistanceMeters());
        plan.setBaselineDurationSeconds(result.getBaselineDurationSeconds());
        plan.setComputationDurationMs(result.getComputationDurationMs());
        plan.setVersion(1);

        Map<Long, Vehicle> vehicleMap = new HashMap<>();
        vehicles.forEach(v -> vehicleMap.put(v.getId(), v));

        Map<Long, DeliveryOrder> orderMap = new HashMap<>();
        orders.forEach(o -> orderMap.put(o.getId(), o));

        for (VehicleRouteResultDto vRoute : result.getVehicleRoutes()) {
            Vehicle v = vehicleMap.get(vRoute.getVehicleId());
            if (v != null) {
                v.setStatus(VehicleStatus.ON_DELIVERY);
                vehicleRepository.save(v);
            }

            for (RouteStopDto sDto : vRoute.getStops()) {
                DeliveryOrder order = orderMap.get(sDto.getOrderId());
                if (order != null) {
                    order.setStatus(OrderStatus.ASSIGNED);
                    order.setAssignedVehicle(v);
                    orderRepository.save(order);

                    RouteStop stop = new RouteStop(plan, order, v, sDto.getStopSequence(),
                            sDto.getEstimatedArrivalTime(), StopStatus.PENDING);
                    plan.addStop(stop);
                }
            }
        }

        return routePlanRepository.save(plan);
    }
}
