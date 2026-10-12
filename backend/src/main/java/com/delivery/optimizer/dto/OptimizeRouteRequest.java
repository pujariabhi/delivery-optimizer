package com.delivery.optimizer.dto;

import com.delivery.optimizer.entity.RouteObjective;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OptimizeRouteRequest {

    @NotEmpty(message = "At least one order must be selected for optimization")
    private List<Long> orderIds;

    @NotEmpty(message = "At least one vehicle must be selected")
    private List<Long> vehicleIds;

    @NotNull(message = "Optimization objective is required")
    private RouteObjective objective = RouteObjective.MINIMIZE_TIME;

    private boolean saveAsActivePlan = false;

    public OptimizeRouteRequest() {
    }

    public List<Long> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<Long> orderIds) {
        this.orderIds = orderIds;
    }

    public List<Long> getVehicleIds() {
        return vehicleIds;
    }

    public void setVehicleIds(List<Long> vehicleIds) {
        this.vehicleIds = vehicleIds;
    }

    public RouteObjective getObjective() {
        return objective;
    }

    public void setObjective(RouteObjective objective) {
        this.objective = objective;
    }

    public boolean isSaveAsActivePlan() {
        return saveAsActivePlan;
    }

    public void setSaveAsActivePlan(boolean saveAsActivePlan) {
        this.saveAsActivePlan = saveAsActivePlan;
    }
}
