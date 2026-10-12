package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.WebSocketEventDto;
import com.delivery.optimizer.service.WebSocketEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketEventServiceImpl implements WebSocketEventService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventServiceImpl.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventServiceImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void broadcastVehicleLocation(Object payload) {
        WebSocketEventDto event = new WebSocketEventDto("VEHICLE_LOCATION_UPDATE", payload);
        messagingTemplate.convertAndSend("/topic/vehicle-locations", event);
    }

    @Override
    public void broadcastOrderUpdate(Object payload) {
        WebSocketEventDto event = new WebSocketEventDto("ORDER_STATUS_UPDATE", payload);
        messagingTemplate.convertAndSend("/topic/order-updates", event);
    }

    @Override
    public void broadcastRouteUpdate(Object payload) {
        WebSocketEventDto event = new WebSocketEventDto("ROUTE_PLAN_UPDATE", payload);
        messagingTemplate.convertAndSend("/topic/route-updates", event);
    }

    @Override
    public void broadcastTrafficUpdate(Object payload) {
        WebSocketEventDto event = new WebSocketEventDto("TRAFFIC_CONDITION_UPDATE", payload);
        messagingTemplate.convertAndSend("/topic/traffic-updates", event);
    }

    @Override
    public void broadcastOptimizationEvent(Object payload) {
        WebSocketEventDto event = new WebSocketEventDto("OPTIMIZATION_RUN_UPDATE", payload);
        messagingTemplate.convertAndSend("/topic/optimization-events", event);
    }
}
