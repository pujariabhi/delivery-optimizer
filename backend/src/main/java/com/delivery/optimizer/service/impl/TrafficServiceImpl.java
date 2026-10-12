package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.entity.RoutePlan;
import com.delivery.optimizer.entity.RouteStatus;
import com.delivery.optimizer.entity.TrafficScenario;
import com.delivery.optimizer.entity.TrafficType;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.repository.TrafficScenarioRepository;
import com.delivery.optimizer.service.RouteOptimizationService;
import com.delivery.optimizer.service.TrafficService;
import com.delivery.optimizer.service.TravelTimeService;
import com.delivery.optimizer.service.WebSocketEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TrafficServiceImpl implements TrafficService {

    private static final Logger log = LoggerFactory.getLogger(TrafficServiceImpl.class);

    private final TrafficScenarioRepository trafficScenarioRepository;
    private final TravelTimeService travelTimeService;
    private final WebSocketEventService webSocketEventService;
    private final RoutePlanRepository routePlanRepository;
    private final RouteOptimizationService routeOptimizationService;

    public TrafficServiceImpl(TrafficScenarioRepository trafficScenarioRepository,
                              TravelTimeService travelTimeService,
                              WebSocketEventService webSocketEventService,
                              RoutePlanRepository routePlanRepository,
                              RouteOptimizationService routeOptimizationService) {
        this.trafficScenarioRepository = trafficScenarioRepository;
        this.travelTimeService = travelTimeService;
        this.webSocketEventService = webSocketEventService;
        this.routePlanRepository = routePlanRepository;
        this.routeOptimizationService = routeOptimizationService;
    }

    @Override
    public List<TrafficScenario> getAllScenarios() {
        return trafficScenarioRepository.findAll();
    }

    @Override
    public TrafficScenario getActiveScenario() {
        return trafficScenarioRepository.findByActiveTrue()
                .orElseGet(() -> {
                    TrafficScenario fallback = new TrafficScenario("Default Normal Traffic", TrafficType.NORMAL, "{}", true);
                    return trafficScenarioRepository.save(fallback);
                });
    }

    @Override
    @Transactional
    public TrafficScenario activateScenario(Long id) {
        TrafficScenario scenario = trafficScenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Traffic scenario not found with id: " + id));

        // Deactivate other scenarios
        List<TrafficScenario> all = trafficScenarioRepository.findAll();
        for (TrafficScenario s : all) {
            s.setActive(s.getId().equals(id));
            trafficScenarioRepository.save(s);
        }

        // Apply to in-memory graph
        travelTimeService.applyTrafficScenario(scenario.getScenarioType(), Collections.emptyList());

        // Broadcast to WebSocket topic
        webSocketEventService.broadcastTrafficUpdate(scenario);

        // Dynamic route recalculation if an active route plan exists
        Optional<RoutePlan> activePlan = routePlanRepository.findFirstByStatusOrderByCreatedAtDesc(RouteStatus.ACTIVE);
        if (activePlan.isPresent()) {
            try {
                log.info("Triggering dynamic route recalculation due to traffic scenario change: {}", scenario.getName());
                routeOptimizationService.recalculateRoutePlan(
                        activePlan.get().getId(),
                        "Traffic scenario changed to: " + scenario.getName() + " (" + scenario.getScenarioType() + ")"
                );
            } catch (Exception ex) {
                log.warn("Could not dynamically recalculate route plan: {}", ex.getMessage());
            }
        }

        return scenario;
    }

    @Override
    @Transactional
    public TrafficScenario createScenario(String name, TrafficType type, String configJson) {
        TrafficScenario scenario = new TrafficScenario(name, type, configJson, false);
        return trafficScenarioRepository.save(scenario);
    }
}
