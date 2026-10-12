package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.OptimizeRouteRequest;
import com.delivery.optimizer.dto.RouteOptimizationResultDto;

public interface RouteOptimizationService {
    RouteOptimizationResultDto optimizeRoutes(OptimizeRouteRequest request);
    RouteOptimizationResultDto recalculateRoutePlan(Long routePlanId, String reason);
}
