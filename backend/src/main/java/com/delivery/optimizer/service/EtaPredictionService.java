package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.EtaAccuracyReportDto;
import com.delivery.optimizer.dto.RouteStopDto;
import com.delivery.optimizer.entity.DeliveryOrder;
import com.delivery.optimizer.entity.RouteObjective;

import java.time.LocalDateTime;
import java.util.List;

public interface EtaPredictionService {
    LocalDateTime predictStopArrival(LocalDateTime startTime, long accumulatedTravelSeconds, int stopIndex);
    void populatePredictiveEtas(List<RouteStopDto> stops, double startLat, double startLon, RouteObjective objective, LocalDateTime startTime);
    long estimateStopServiceTimeSeconds(DeliveryOrder order);
    EtaAccuracyReportDto evaluateHistoricalEtaAccuracy();
}
