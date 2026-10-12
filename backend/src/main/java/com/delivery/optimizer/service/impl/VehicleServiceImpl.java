package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.dto.VehicleDto;
import com.delivery.optimizer.entity.RoutePlan;
import com.delivery.optimizer.entity.RouteStatus;
import com.delivery.optimizer.entity.Vehicle;
import com.delivery.optimizer.entity.VehicleStatus;
import com.delivery.optimizer.exception.ResourceNotFoundException;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.repository.VehicleRepository;
import com.delivery.optimizer.service.RouteOptimizationService;
import com.delivery.optimizer.service.VehicleService;
import com.delivery.optimizer.service.WebSocketEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {

    private static final Logger log = LoggerFactory.getLogger(VehicleServiceImpl.class);

    private final VehicleRepository vehicleRepository;
    private final RoutePlanRepository routePlanRepository;
    private final RouteOptimizationService routeOptimizationService;
    private final WebSocketEventService webSocketEventService;

    public VehicleServiceImpl(VehicleRepository vehicleRepository,
                              RoutePlanRepository routePlanRepository,
                              RouteOptimizationService routeOptimizationService,
                              WebSocketEventService webSocketEventService) {
        this.vehicleRepository = vehicleRepository;
        this.routePlanRepository = routePlanRepository;
        this.routeOptimizationService = routeOptimizationService;
        this.webSocketEventService = webSocketEventService;
    }

    @Override
    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return mapToDto(vehicle);
    }

    @Override
    @Transactional
    public VehicleDto createVehicle(VehicleDto dto) {
        Vehicle vehicle = new Vehicle(
                dto.getRegistrationNumber(),
                dto.getVehicleType(),
                dto.getCapacityKg(),
                dto.getStatus() != null ? dto.getStatus() : VehicleStatus.AVAILABLE,
                dto.getDriverName(),
                dto.getCurrentLatitude(),
                dto.getCurrentLongitude()
        );

        Vehicle saved = vehicleRepository.save(vehicle);
        VehicleDto result = mapToDto(saved);
        webSocketEventService.broadcastVehicleLocation(result);
        return result;
    }

    @Override
    @Transactional
    public VehicleDto updateVehicle(Long id, VehicleDto dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setRegistrationNumber(dto.getRegistrationNumber());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setCapacityKg(dto.getCapacityKg());
        vehicle.setDriverName(dto.getDriverName());
        vehicle.setCurrentLatitude(dto.getCurrentLatitude());
        vehicle.setCurrentLongitude(dto.getCurrentLongitude());
        if (dto.getStatus() != null) {
            vehicle.setStatus(dto.getStatus());
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        VehicleDto result = mapToDto(saved);
        webSocketEventService.broadcastVehicleLocation(result);
        return result;
    }

    @Override
    @Transactional
    public VehicleDto updateVehicleStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        VehicleStatus prevStatus = vehicle.getStatus();
        vehicle.setStatus(status);
        Vehicle saved = vehicleRepository.save(vehicle);
        VehicleDto result = mapToDto(saved);

        // If vehicle became unavailable while on delivery, trigger dynamic recalculation
        if ((status == VehicleStatus.MAINTENANCE || status == VehicleStatus.INACTIVE) && prevStatus == VehicleStatus.ON_DELIVERY) {
            Optional<RoutePlan> activePlan = routePlanRepository.findFirstByStatusOrderByCreatedAtDesc(RouteStatus.ACTIVE);
            activePlan.ifPresent(p -> {
                try {
                    log.info("Vehicle {} is now {}; triggering route recalculation for fleet.", vehicle.getRegistrationNumber(), status);
                    routeOptimizationService.recalculateRoutePlan(p.getId(), "Vehicle " + vehicle.getRegistrationNumber() + " became unavailable");
                } catch (Exception ex) {
                    log.warn("Failed to recalculate plan upon vehicle breakdown: {}", ex.getMessage());
                }
            });
        }

        return result;
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleType(vehicle.getVehicleType());
        dto.setCapacityKg(vehicle.getCapacityKg());
        dto.setStatus(vehicle.getStatus());
        dto.setDriverName(vehicle.getDriverName());
        dto.setCurrentLatitude(vehicle.getCurrentLatitude());
        dto.setCurrentLongitude(vehicle.getCurrentLongitude());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());
        return dto;
    }
}
