package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.OptimizeRouteRequest;
import com.delivery.optimizer.dto.RouteOptimizationResultDto;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.repository.*;
import com.delivery.optimizer.service.DataSeederService;
import com.delivery.optimizer.service.RouteOptimizationService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class DataSeederServiceImpl implements DataSeederService {

    private static final Logger log = LoggerFactory.getLogger(DataSeederServiceImpl.class);

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final TrafficScenarioRepository trafficScenarioRepository;
    private final RoutePlanRepository routePlanRepository;
    private final RouteStopRepository routeStopRepository;
    private final OptimizationRunRepository optimizationRunRepository;
    private final VehicleLocationRepository vehicleLocationRepository;
    private final PasswordEncoder passwordEncoder;
    private final RouteOptimizationService routeOptimizationService;

    public DataSeederServiceImpl(UserRepository userRepository,
                                 VehicleRepository vehicleRepository,
                                 DeliveryOrderRepository orderRepository,
                                 TrafficScenarioRepository trafficScenarioRepository,
                                 RoutePlanRepository routePlanRepository,
                                 RouteStopRepository routeStopRepository,
                                 OptimizationRunRepository optimizationRunRepository,
                                 VehicleLocationRepository vehicleLocationRepository,
                                 PasswordEncoder passwordEncoder,
                                 RouteOptimizationService routeOptimizationService) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        this.trafficScenarioRepository = trafficScenarioRepository;
        this.routePlanRepository = routePlanRepository;
        this.routeStopRepository = routeStopRepository;
        this.optimizationRunRepository = optimizationRunRepository;
        this.vehicleLocationRepository = vehicleLocationRepository;
        this.passwordEncoder = passwordEncoder;
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostConstruct
    public void init() {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding initial demonstration data...");
            seedInitialData();
        }
    }

    @Override
    @Transactional
    public void resetDevelopmentData() {
        log.warn("Resetting development database to initial clean state...");
        vehicleLocationRepository.deleteAllInBatch();
        routeStopRepository.deleteAllInBatch();
        routePlanRepository.deleteAllInBatch();
        optimizationRunRepository.deleteAllInBatch();
        orderRepository.deleteAllInBatch();
        vehicleRepository.deleteAllInBatch();
        trafficScenarioRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        seedInitialData();
        log.info("Development database successfully reset and re-seeded.");
    }

    @Override
    @Transactional
    public void seedInitialData() {
        // 1. Seed Users
        User admin = new User("System Administrator", "admin@delivery.com",
                passwordEncoder.encode("admin123"), Role.ROLE_ADMIN);
        User dispatcher = new User("Operations Dispatcher", "dispatcher@delivery.com",
                passwordEncoder.encode("admin123"), Role.ROLE_DISPATCHER);
        User customer = new User("Ananya Deshmukh", "customer@delivery.com",
                passwordEncoder.encode("customer123"), Role.ROLE_CUSTOMER);
        userRepository.saveAll(Arrays.asList(admin, dispatcher, customer));

        // 2. Seed Fleet Vehicles
        Vehicle v1 = new Vehicle("KA-01-EA-1001", VehicleType.VAN, BigDecimal.valueOf(500.0),
                VehicleStatus.AVAILABLE, "Rahul Sharma", BigDecimal.valueOf(12.9716), BigDecimal.valueOf(77.5946));
        Vehicle v2 = new Vehicle("KA-03-EV-2045", VehicleType.ELECTRIC_VAN, BigDecimal.valueOf(350.0),
                VehicleStatus.AVAILABLE, "Priya Nair", BigDecimal.valueOf(12.9750), BigDecimal.valueOf(77.6090));
        Vehicle v3 = new Vehicle("KA-05-BK-9182", VehicleType.BIKE, BigDecimal.valueOf(45.0),
                VehicleStatus.AVAILABLE, "Amit Patel", BigDecimal.valueOf(12.9352), BigDecimal.valueOf(77.6245));
        Vehicle v4 = new Vehicle("KA-02-TR-5533", VehicleType.TRUCK, BigDecimal.valueOf(1200.0),
                VehicleStatus.AVAILABLE, "Vikram Singh", BigDecimal.valueOf(12.9116), BigDecimal.valueOf(77.6389));

        List<Vehicle> savedVehicles = vehicleRepository.saveAll(Arrays.asList(v1, v2, v3, v4));

        // 3. Seed Realistic Delivery Orders
        List<DeliveryOrder> orders = Arrays.asList(
                new DeliveryOrder("ORD-8410", "Ananya Deshmukh", "100ft Road, Indiranagar",
                        BigDecimal.valueOf(12.9784), BigDecimal.valueOf(77.6408), BigDecimal.valueOf(4.5),
                        OrderPriority.HIGH, "09:00", "12:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8411", "Rohan Varma", "Koramangala 5th Block",
                        BigDecimal.valueOf(12.9352), BigDecimal.valueOf(77.6245), BigDecimal.valueOf(8.2),
                        OrderPriority.URGENT, "10:00", "13:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8412", "Sneha Reddy", "Sector 1, HSR Layout",
                        BigDecimal.valueOf(12.9116), BigDecimal.valueOf(77.6389), BigDecimal.valueOf(14.0),
                        OrderPriority.MEDIUM, "11:00", "15:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8413", "Karthik Iyer", "BTM Layout 2nd Stage",
                        BigDecimal.valueOf(12.9166), BigDecimal.valueOf(77.6101), BigDecimal.valueOf(3.8),
                        OrderPriority.LOW, "12:00", "16:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8414", "Meera Krishnan", "4th Block, Jayanagar",
                        BigDecimal.valueOf(12.9299), BigDecimal.valueOf(77.5824), BigDecimal.valueOf(6.5),
                        OrderPriority.MEDIUM, "10:00", "14:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8415", "Sanjay Hegde", "Malleshwaram 8th Cross",
                        BigDecimal.valueOf(13.0031), BigDecimal.valueOf(77.5701), BigDecimal.valueOf(11.2),
                        OrderPriority.HIGH, "09:30", "12:30", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8416", "Deepa Rao", "Rajajinagar 1st Block",
                        BigDecimal.valueOf(12.9901), BigDecimal.valueOf(77.5526), BigDecimal.valueOf(5.0),
                        OrderPriority.LOW, "14:00", "18:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8417", "Nikhil Joshi", "Hebbal Lake Vista",
                        BigDecimal.valueOf(13.0358), BigDecimal.valueOf(77.5970), BigDecimal.valueOf(7.8),
                        OrderPriority.URGENT, "10:30", "13:30", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8418", "Tanvi Saxena", "Bellandur Outer Ring Road",
                        BigDecimal.valueOf(12.9304), BigDecimal.valueOf(77.6784), BigDecimal.valueOf(9.4),
                        OrderPriority.MEDIUM, "11:30", "15:30", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8419", "Arjun Menon", "Marathahalli Bridge Junction",
                        BigDecimal.valueOf(12.9591), BigDecimal.valueOf(77.6974), BigDecimal.valueOf(15.6),
                        OrderPriority.HIGH, "13:00", "17:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8420", "Pooja Hegde", "Whitefield ITPL Main Road",
                        BigDecimal.valueOf(12.9856), BigDecimal.valueOf(77.7289), BigDecimal.valueOf(22.0),
                        OrderPriority.MEDIUM, "14:00", "18:00", OrderStatus.PENDING),
                new DeliveryOrder("ORD-8421", "Manoj Nambiar", "Electronic City Phase 1",
                        BigDecimal.valueOf(12.8452), BigDecimal.valueOf(77.6602), BigDecimal.valueOf(18.5),
                        OrderPriority.LOW, "15:00", "19:00", OrderStatus.PENDING)
        );
        List<DeliveryOrder> savedOrders = orderRepository.saveAll(orders);

        // 4. Seed Traffic Scenarios
        TrafficScenario s1 = new TrafficScenario("Normal Traffic Conditions", TrafficType.NORMAL, "{\"speedMultiplier\":1.0}", true);
        TrafficScenario s2 = new TrafficScenario("Monsoon Rain Congestion", TrafficType.MODERATE, "{\"speedMultiplier\":0.74}", false);
        TrafficScenario s3 = new TrafficScenario("Evening Peak Gridlock", TrafficType.HEAVY, "{\"speedMultiplier\":0.54}", false);
        TrafficScenario s4 = new TrafficScenario("MG Road Flyover Closure", TrafficType.ROAD_CLOSURE, "{\"closedRoads\":[\"E_DEPOT_MG_fw\",\"E_DEPOT_MG_bw\"]}", false);
        trafficScenarioRepository.saveAll(Arrays.asList(s1, s2, s3, s4));

        // 5. Seed Initial Active Route Plan
        try {
            OptimizeRouteRequest optReq = new OptimizeRouteRequest();
            List<Long> selectedOrderIds = new ArrayList<>();
            for (int i = 0; i < 8; i++) {
                selectedOrderIds.add(savedOrders.get(i).getId());
            }
            optReq.setOrderIds(selectedOrderIds);
            optReq.setVehicleIds(Arrays.asList(savedVehicles.get(0).getId(), savedVehicles.get(1).getId()));
            optReq.setObjective(RouteObjective.MINIMIZE_TIME);
            optReq.setSaveAsActivePlan(true);

            RouteOptimizationResultDto initialPlan = routeOptimizationService.optimizeRoutes(optReq);
            log.info("Initial demo route plan seeded with ID: {}", initialPlan.getRoutePlanId());
        } catch (Exception ex) {
            log.warn("Could not seed initial route plan: {}", ex.getMessage());
        }

        log.info("Data seeding complete: 2 Users, 4 Vehicles, 12 Orders, 4 Traffic Scenarios.");
    }
}
