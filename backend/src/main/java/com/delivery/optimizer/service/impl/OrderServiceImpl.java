package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.OrderDto;
import com.delivery.optimizer.entity.*;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.DeliveryOrderRepository;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.repository.VehicleRepository;
import com.delivery.optimizer.service.OrderService;
import com.delivery.optimizer.service.RouteOptimizationService;
import com.delivery.optimizer.service.WebSocketEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final DeliveryOrderRepository orderRepository;
    private final VehicleRepository vehicleRepository;
    private final RoutePlanRepository routePlanRepository;
    private final WebSocketEventService webSocketEventService;
    private final RouteOptimizationService routeOptimizationService;

    public OrderServiceImpl(DeliveryOrderRepository orderRepository,
                            VehicleRepository vehicleRepository,
                            RoutePlanRepository routePlanRepository,
                            WebSocketEventService webSocketEventService,
                            RouteOptimizationService routeOptimizationService) {
        this.orderRepository = orderRepository;
        this.vehicleRepository = vehicleRepository;
        this.routePlanRepository = routePlanRepository;
        this.webSocketEventService = webSocketEventService;
        this.routeOptimizationService = routeOptimizationService;
    }

    @Override
    public Page<OrderDto> getOrders(String query, OrderStatus status, OrderPriority priority, Pageable pageable) {
        return orderRepository.searchOrders(query, status, priority, pageable)
                .map(this::mapToDto);
    }

    @Override
    public List<OrderDto> getPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.PENDING).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto getOrderById(Long id) {
        DeliveryOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryOrder not found with id: " + id));
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderDto createOrder(OrderDto dto) {
        DeliveryOrder order = new DeliveryOrder();

        if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) {
            order.setOrderNumber("ORD-" + (System.currentTimeMillis() % 1000000));
        } else {
            order.setOrderNumber(dto.getOrderNumber());
        }

        order.setCustomerName(dto.getCustomerName());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setLatitude(dto.getLatitude());
        order.setLongitude(dto.getLongitude());
        order.setPackageWeightKg(dto.getPackageWeightKg());
        order.setPriority(dto.getPriority() != null ? dto.getPriority() : OrderPriority.MEDIUM);
        order.setTimeWindowStart(dto.getTimeWindowStart());
        order.setTimeWindowEnd(dto.getTimeWindowEnd());
        order.setStatus(OrderStatus.PENDING);

        if (dto.getAssignedVehicleId() != null) {
            vehicleRepository.findById(dto.getAssignedVehicleId()).ifPresent(order::setAssignedVehicle);
        }

        DeliveryOrder saved = orderRepository.save(order);
        OrderDto result = mapToDto(saved);

        webSocketEventService.broadcastOrderUpdate(result);

        // Dynamic Reoptimization check if an active plan exists
        Optional<RoutePlan> activePlan = routePlanRepository.findFirstByStatusOrderByCreatedAtDesc(RouteStatus.ACTIVE);
        if (activePlan.isPresent()) {
            try {
                log.info("New order arrived: {}. Triggering dynamic route recalculation.", saved.getOrderNumber());
                routeOptimizationService.recalculateRoutePlan(
                        activePlan.get().getId(),
                        "Dynamic order insertion: " + saved.getOrderNumber()
                );
            } catch (Exception ex) {
                log.warn("Auto recalculation skipped for new order {}: {}", saved.getOrderNumber(), ex.getMessage());
            }
        }

        return result;
    }

    @Override
    @Transactional
    public OrderDto updateOrder(Long id, OrderDto dto) {
        DeliveryOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryOrder not found with id: " + id));

        order.setCustomerName(dto.getCustomerName());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setLatitude(dto.getLatitude());
        order.setLongitude(dto.getLongitude());
        order.setPackageWeightKg(dto.getPackageWeightKg());
        order.setPriority(dto.getPriority());
        order.setTimeWindowStart(dto.getTimeWindowStart());
        order.setTimeWindowEnd(dto.getTimeWindowEnd());

        if (dto.getStatus() != null) {
            order.setStatus(dto.getStatus());
        }

        if (dto.getAssignedVehicleId() != null) {
            Vehicle v = vehicleRepository.findById(dto.getAssignedVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + dto.getAssignedVehicleId()));
            order.setAssignedVehicle(v);
        } else {
            order.setAssignedVehicle(null);
        }

        DeliveryOrder saved = orderRepository.save(order);
        OrderDto result = mapToDto(saved);
        webSocketEventService.broadcastOrderUpdate(result);
        return result;
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, OrderStatus status) {
        DeliveryOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryOrder not found with id: " + id));

        order.setStatus(status);
        DeliveryOrder saved = orderRepository.save(order);
        OrderDto result = mapToDto(saved);
        webSocketEventService.broadcastOrderUpdate(result);

        // If order was cancelled, trigger dynamic recalculation
        if (status == OrderStatus.CANCELLED) {
            Optional<RoutePlan> activePlan = routePlanRepository.findFirstByStatusOrderByCreatedAtDesc(RouteStatus.ACTIVE);
            activePlan.ifPresent(p -> {
                try {
                    routeOptimizationService.recalculateRoutePlan(p.getId(), "Order cancelled: " + order.getOrderNumber());
                } catch (Exception e) {
                    log.warn("Failed to recalculate plan upon order cancellation: {}", e.getMessage());
                }
            });
        }

        return result;
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        DeliveryOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryOrder not found with id: " + id));
        orderRepository.delete(order);
        webSocketEventService.broadcastOrderUpdate("Order #" + id + " was deleted.");
    }

    private OrderDto mapToDto(DeliveryOrder order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setLatitude(order.getLatitude());
        dto.setLongitude(order.getLongitude());
        dto.setPackageWeightKg(order.getPackageWeightKg());
        dto.setPriority(order.getPriority());
        dto.setTimeWindowStart(order.getTimeWindowStart());
        dto.setTimeWindowEnd(order.getTimeWindowEnd());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getAssignedVehicle() != null) {
            dto.setAssignedVehicleId(order.getAssignedVehicle().getId());
            dto.setAssignedVehicleRegistration(order.getAssignedVehicle().getRegistrationNumber());
        }

        return dto;
    }
}
