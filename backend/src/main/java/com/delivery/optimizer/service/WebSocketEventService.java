package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.WebSocketEventDto;

public interface WebSocketEventService {
    void broadcastVehicleLocation(Object payload);
    void broadcastOrderUpdate(Object payload);
    void broadcastRouteUpdate(Object payload);
    void broadcastTrafficUpdate(Object payload);
    void broadcastOptimizationEvent(Object payload);
}
