package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.DeliveryOrderRepository;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.repository.VehicleRepository;
import com.delivery.optimizer.service.VehicleAssignmentService;
import com.delivery.optimizer.service.WebSocketEventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleAssignmentServiceImpl implements VehicleAssignmentService {

    private final RoutePlanRepository routePlanRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final WebSocketEventService webSocketEventService;

    public VehicleAssignmentServiceImpl(RoutePlanRepository routePlanRepository,
                                        VehicleRepository vehicleRepository,
                                        DeliveryOrderRepository orderRepository,
                                        WebSocketEventService webSocketEventService) {
        this.routePlanRepository = routePlanRepository;
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        this.webSocketEventService = webSocketEventService;
    }

    @Override
    @Transactional
    public RoutePlan assignRoutePlan(Long routePlanId) {
        RoutePlan plan = routePlanRepository.findByIdWithStops(routePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("RoutePlan not found with id: " + routePlanId));

        plan.setStatus(RouteStatus.ACTIVE);

        for (RouteStop stop : plan.getStops()) {
            Vehicle vehicle = stop.getVehicle();
            if (vehicle != null && vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ON_DELIVERY);
                vehicleRepository.save(vehicle);
            }

            DeliveryOrder order = stop.getOrder();
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.ASSIGNED);
                order.setAssignedVehicle(vehicle);
                orderRepository.save(order);
            }
        }

        RoutePlan saved = routePlanRepository.save(plan);

        // Notify subscribers
        webSocketEventService.broadcastRouteUpdate(saved.getId());
        webSocketEventService.broadcastOrderUpdate("Route plan #" + saved.getId() + " assigned and active.");

        return saved;
    }
}
