package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.VehicleDto;
import com.delivery.optimizer.entity.VehicleStatus;

import java.util.List;

public interface VehicleService {
    List<VehicleDto> getAllVehicles();
    List<VehicleDto> getAvailableVehicles();
    VehicleDto getVehicleById(Long id);
    VehicleDto createVehicle(VehicleDto dto);
    VehicleDto updateVehicle(Long id, VehicleDto dto);
    VehicleDto updateVehicleStatus(Long id, VehicleStatus status);
    void deleteVehicle(Long id);
}
