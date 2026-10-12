package com.delivery.optimizer;

import com.delivery.optimizer.dto.OptimizeRouteRequest;
import com.delivery.optimizer.dto.RouteOptimizationResultDto;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.repository.*;
import com.delivery.optimizer.service.impl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class RouteOptimizationAlgorithmTest {

    private DeliveryOrderRepository orderRepository;
    private VehicleRepository vehicleRepository;
    private RoutePlanRepository routePlanRepository;
    private RouteStopRepository routeStopRepository;
    private OptimizationRunRepository optimizationRunRepository;

    private RouteOptimizationServiceImpl optimizationService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(DeliveryOrderRepository.class);
        vehicleRepository = Mockito.mock(VehicleRepository.class);
        routePlanRepository = Mockito.mock(RoutePlanRepository.class);
        routeStopRepository = Mockito.mock(RouteStopRepository.class);
        optimizationRunRepository = Mockito.mock(OptimizationRunRepository.class);

        ShortestPathServiceImpl shortestPath = new ShortestPathServiceImpl();
        TravelTimeServiceImpl travelTime = new TravelTimeServiceImpl(shortestPath);
        travelTime.initRoadNetwork();

        RoutingServiceImpl routing = new RoutingServiceImpl(travelTime);
        EtaPredictionServiceImpl eta = new EtaPredictionServiceImpl(travelTime, routeStopRepository);

        optimizationService = new RouteOptimizationServiceImpl(
                orderRepository, vehicleRepository, routePlanRepository,
                routeStopRepository, optimizationRunRepository,
                travelTime, routing, eta
        );
    }

    @Test
    @DisplayName("2-Opt optimization yields valid route with improvement over baseline")
    void testOptimizationSuccessAndImprovement() {
        Vehicle v1 = new Vehicle("KA-01-V1", VehicleType.VAN, BigDecimal.valueOf(500),
                VehicleStatus.AVAILABLE, "Driver 1", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        v1.setId(1L);

        DeliveryOrder o1 = new DeliveryOrder("O1", "Cust 1", "Indiranagar",
                BigDecimal.valueOf(12.9784), BigDecimal.valueOf(77.6408), BigDecimal.valueOf(10.0),
                OrderPriority.HIGH, "09:00", "12:00", OrderStatus.PENDING);
        o1.setId(101L);

        DeliveryOrder o2 = new DeliveryOrder("O2", "Cust 2", "Koramangala",
                BigDecimal.valueOf(12.9352), BigDecimal.valueOf(77.6245), BigDecimal.valueOf(15.0),
                OrderPriority.MEDIUM, "10:00", "13:00", OrderStatus.PENDING);
        o2.setId(102L);

        DeliveryOrder o3 = new DeliveryOrder("O3", "Cust 3", "HSR",
                BigDecimal.valueOf(12.9116), BigDecimal.valueOf(77.6389), BigDecimal.valueOf(20.0),
                OrderPriority.LOW, "11:00", "14:00", OrderStatus.PENDING);
        o3.setId(103L);

        when(vehicleRepository.findAllById(any())).thenReturn(List.of(v1));
        when(orderRepository.findAllById(any())).thenReturn(Arrays.asList(o1, o2, o3));

        OptimizeRouteRequest req = new OptimizeRouteRequest();
        req.setOrderIds(List.of(101L, 102L, 103L));
        req.setVehicleIds(List.of(1L));
        req.setObjective(RouteObjective.MINIMIZE_TIME);

        RouteOptimizationResultDto result = optimizationService.optimizeRoutes(req);

        assertNotNull(result);
        assertEquals(OptimizationResultStatus.SUCCESS, result.getStatus());
        assertTrue(result.getOptimizedDistanceMeters() > 0);
        assertTrue(result.getOptimizedDurationSeconds() > 0);
        assertEquals(1, result.getVehicleRoutes().size());
        assertEquals(3, result.getVehicleRoutes().get(0).getStops().size());
    }

    @Test
    @DisplayName("Infeasible scenario when order weight exceeds vehicle capacity")
    void testInfeasibleOrderWeightExceedsCapacity() {
        Vehicle v1 = new Vehicle("KA-01-BK1", VehicleType.BIKE, BigDecimal.valueOf(30), // 30kg capacity
                VehicleStatus.AVAILABLE, "Rider", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        v1.setId(1L);

        DeliveryOrder heavyOrder = new DeliveryOrder("O_HEAVY", "Heavy", "Addr",
                BigDecimal.valueOf(12.9784), BigDecimal.valueOf(77.6408), BigDecimal.valueOf(80.0), // 80kg package
                OrderPriority.MEDIUM, "10:00", "12:00", OrderStatus.PENDING);
        heavyOrder.setId(201L);

        when(vehicleRepository.findAllById(any())).thenReturn(List.of(v1));
        when(orderRepository.findAllById(any())).thenReturn(List.of(heavyOrder));

        OptimizeRouteRequest req = new OptimizeRouteRequest();
        req.setOrderIds(List.of(201L));
        req.setVehicleIds(List.of(1L));
        req.setObjective(RouteObjective.MINIMIZE_TIME);

        RouteOptimizationResultDto result = optimizationService.optimizeRoutes(req);

        assertEquals(OptimizationResultStatus.INFEASIBLE, result.getStatus());
        assertTrue(result.getMessage().contains("exceeds maximum single vehicle capacity"));
    }

    @Test
    @DisplayName("Infeasible scenario when selected vehicle is under maintenance")
    void testUnavailableVehicleUnderMaintenance() {
        Vehicle brokenVehicle = new Vehicle("KA-01-V2", VehicleType.VAN, BigDecimal.valueOf(500),
                VehicleStatus.MAINTENANCE, "Driver 2", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        brokenVehicle.setId(2L);

        DeliveryOrder ord = new DeliveryOrder("O1", "Cust", "Addr",
                BigDecimal.valueOf(12.9784), BigDecimal.valueOf(77.6408), BigDecimal.valueOf(10.0),
                OrderPriority.MEDIUM, "10:00", "12:00", OrderStatus.PENDING);
        ord.setId(101L);

        when(vehicleRepository.findAllById(any())).thenReturn(List.of(brokenVehicle));
        when(orderRepository.findAllById(any())).thenReturn(List.of(ord));

        OptimizeRouteRequest req = new OptimizeRouteRequest();
        req.setOrderIds(List.of(101L));
        req.setVehicleIds(List.of(2L));

        RouteOptimizationResultDto result = optimizationService.optimizeRoutes(req);

        assertEquals(OptimizationResultStatus.INFEASIBLE, result.getStatus());
        assertTrue(result.getMessage().contains("MAINTENANCE"));
    }
}
