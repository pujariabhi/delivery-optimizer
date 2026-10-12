package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.DashboardSummaryDto;
import com.delivery.optimizer.dto.DeliveryTrendDto;
import com.delivery.optimizer.dto.VehicleUtilizationDto;

import java.util.List;

public interface DashboardService {
    DashboardSummaryDto getDashboardSummary();
    List<DeliveryTrendDto> getDeliveryTrends();
    List<VehicleUtilizationDto> getVehicleUtilization();
}
