package com.delivery.optimizer;

import com.delivery.optimizer.dto.OptimizeRouteRequest;
import com.delivery.optimizer.dto.RouteOptimizationResultDto;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.repository.*;
import com.delivery.optimizer.service.impl.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class RoutingBenchmarkTest {

    @Test
    @DisplayName("Benchmark Baseline vs 2-Opt Optimized VRP on standard delivery instance")
    void runVrpAlgorithmBenchmark() {
        DeliveryOrderRepository orderRepository = Mockito.mock(DeliveryOrderRepository.class);
        VehicleRepository vehicleRepository = Mockito.mock(VehicleRepository.class);
        RoutePlanRepository routePlanRepository = Mockito.mock(RoutePlanRepository.class);
        RouteStopRepository routeStopRepository = Mockito.mock(RouteStopRepository.class);
        OptimizationRunRepository optimizationRunRepository = Mockito.mock(OptimizationRunRepository.class);

        ShortestPathServiceImpl shortestPath = new ShortestPathServiceImpl();
        TravelTimeServiceImpl travelTime = new TravelTimeServiceImpl(shortestPath);
        travelTime.initRoadNetwork();

        RoutingServiceImpl routing = new RoutingServiceImpl(travelTime);
        EtaPredictionServiceImpl eta = new EtaPredictionServiceImpl(travelTime, routeStopRepository);

        RouteOptimizationServiceImpl optimizationService = new RouteOptimizationServiceImpl(
                orderRepository, vehicleRepository, routePlanRepository,
                routeStopRepository, optimizationRunRepository,
                travelTime, routing, eta
        );

        // 2 vehicles
        Vehicle v1 = new Vehicle("KA-01-V1", VehicleType.VAN, BigDecimal.valueOf(500),
                VehicleStatus.AVAILABLE, "Driver 1", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        v1.setId(1L);
        Vehicle v2 = new Vehicle("KA-01-V2", VehicleType.VAN, BigDecimal.valueOf(500),
                VehicleStatus.AVAILABLE, "Driver 2", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        v2.setId(2L);

        // 8 delivery points spread across test area
        List<DeliveryOrder> orders = new ArrayList<>();
        double[][] points = {
                {12.9784, 77.6408, 5.0},
                {12.9352, 77.6245, 8.0},
                {12.9116, 77.6389, 12.0},
                {12.9166, 77.6101, 4.0},
                {12.9299, 77.5824, 7.0},
                {13.0031, 77.5701, 10.0},
                {12.9901, 77.5526, 6.0},
                {13.0358, 77.5970, 9.0}
        };

        for (int i = 0; i < points.length; i++) {
            DeliveryOrder ord = new DeliveryOrder(
                    "ORD-" + (100 + i), "Customer " + i, "Address " + i,
                    BigDecimal.valueOf(points[i][0]), BigDecimal.valueOf(points[i][1]),
                    BigDecimal.valueOf(points[i][2]),
                    OrderPriority.MEDIUM, "10:00", "14:00", OrderStatus.PENDING);
            ord.setId((long) (100 + i));
            orders.add(ord);
        }

        when(vehicleRepository.findAllById(any())).thenReturn(List.of(v1, v2));
        when(orderRepository.findAllById(any())).thenReturn(orders);

        OptimizeRouteRequest req = new OptimizeRouteRequest();
        req.setOrderIds(List.of(100L, 101L, 102L, 103L, 104L, 105L, 106L, 107L));
        req.setVehicleIds(List.of(1L, 2L));
        req.setObjective(RouteObjective.MINIMIZE_TIME);

        long startBenchmarkTime = System.currentTimeMillis();
        RouteOptimizationResultDto benchmarkResult = optimizationService.optimizeRoutes(req);
        long elapsedBenchmarkTime = System.currentTimeMillis() - startBenchmarkTime;

        // Verify outcomes
        assertNotNull(benchmarkResult);
        assertEquals(OptimizationResultStatus.SUCCESS, benchmarkResult.getStatus());

        System.out.println("========== ROUTE OPTIMIZATION BENCHMARK RESULTS ==========");
        System.out.println("Orders count: " + orders.size() + ", Vehicles count: 2");
        System.out.println("Baseline Total Distance: " + benchmarkResult.getBaselineDistanceMeters() + " meters");
        System.out.println("Optimized Total Distance: " + benchmarkResult.getOptimizedDistanceMeters() + " meters");
        System.out.println("Baseline Total Duration: " + benchmarkResult.getBaselineDurationSeconds() + " seconds");
        System.out.println("Optimized Total Duration: " + benchmarkResult.getOptimizedDurationSeconds() + " seconds");
        System.out.println("Distance Improvement: " + benchmarkResult.getDistanceSavedPercentage() + "%");
        System.out.println("Duration Improvement: " + benchmarkResult.getDurationSavedPercentage() + "%");
        System.out.println("Benchmark Execution Time: " + elapsedBenchmarkTime + " ms");
        System.out.println("==========================================================");

        assertTrue(benchmarkResult.getBaselineDistanceMeters() > 0);
        assertTrue(benchmarkResult.getOptimizedDistanceMeters() > 0);
        assertTrue(benchmarkResult.getComputationDurationMs() > 0);
    }
}
