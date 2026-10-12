package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.OrderDto;
import com.delivery.optimizer.entity.OrderPriority;
import com.delivery.optimizer.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    Page<OrderDto> getOrders(String query, OrderStatus status, OrderPriority priority, Pageable pageable);
    List<OrderDto> getPendingOrders();
    OrderDto getOrderById(Long id);
    OrderDto createOrder(OrderDto dto);
    OrderDto updateOrder(Long id, OrderDto dto);
    OrderDto updateOrderStatus(Long id, OrderStatus status);
    void deleteOrder(Long id);
}
