package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.VehicleLiveStatusDto;

import java.util.List;

public interface SimulationService {
    void startSimulation();
    void stopSimulation();
    boolean isRunning();
    void setSimulationSpeed(double speed);
    double getSimulationSpeed();
    List<VehicleLiveStatusDto> getLiveVehicleStatuses();
}
