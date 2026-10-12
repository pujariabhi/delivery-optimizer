package com.delivery.optimizer.service;

import com.delivery.optimizer.entity.RoutePlan;

public interface VehicleAssignmentService {
    RoutePlan assignRoutePlan(Long routePlanId);
}
