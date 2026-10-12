package com.delivery.optimizer.service;

import com.delivery.optimizer.entity.TrafficScenario;
import com.delivery.optimizer.entity.TrafficType;

import java.util.List;

public interface TrafficService {
    List<TrafficScenario> getAllScenarios();
    TrafficScenario getActiveScenario();
    TrafficScenario activateScenario(Long id);
    TrafficScenario createScenario(String name, TrafficType type, String configJson);
}
