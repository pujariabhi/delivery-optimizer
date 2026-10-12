package com.delivery.optimizer;

import com.delivery.optimizer.dto.EtaAccuracyReportDto;
import com.delivery.optimizer.dto.RouteStopDto;
import com.delivery.optimizer.entity.OrderPriority;
import com.delivery.optimizer.entity.RouteObjective;
import com.delivery.optimizer.repository.RouteStopRepository;
import com.delivery.optimizer.service.impl.EtaPredictionServiceImpl;
import com.delivery.optimizer.service.impl.ShortestPathServiceImpl;
import com.delivery.optimizer.service.impl.TravelTimeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EtaPredictionServiceTest {

    private EtaPredictionServiceImpl etaPredictionService;
    private TravelTimeServiceImpl travelTimeService;

    @BeforeEach
    void setUp() {
        ShortestPathServiceImpl shortestPath = new ShortestPathServiceImpl();
        travelTimeService = new TravelTimeServiceImpl(shortestPath);
        travelTimeService.initRoadNetwork();
        RouteStopRepository routeStopRepository = Mockito.mock(RouteStopRepository.class);

        etaPredictionService = new EtaPredictionServiceImpl(travelTimeService, routeStopRepository);
    }

    @Test
    @DisplayName("Predictive ETA accumulates travel duration and stop service handling times")
    void testEtaAccumulation() {
        List<RouteStopDto> stops = new ArrayList<>();

        RouteStopDto s1 = new RouteStopDto();
        s1.setLatitude(12.9750);
        s1.setLongitude(77.6090);
        s1.setPackageWeightKg(5.0);
        s1.setPriority(OrderPriority.HIGH);
        stops.add(s1);

        RouteStopDto s2 = new RouteStopDto();
        s2.setLatitude(12.9784);
        s2.setLongitude(77.6408);
        s2.setPackageWeightKg(18.0); // Heavy package -> higher service time
        s2.setPriority(OrderPriority.MEDIUM);
        stops.add(s2);

        LocalDateTime start = LocalDateTime.of(2026, 10, 11, 10, 0, 0);
        etaPredictionService.populatePredictiveEtas(stops, 12.9716, 77.5946, RouteObjective.MINIMIZE_TIME, start);

        assertNotNull(s1.getEstimatedArrivalTime());
        assertNotNull(s2.getEstimatedArrivalTime());
        assertTrue(s2.getEstimatedArrivalTime().isAfter(s1.getEstimatedArrivalTime()));
        assertTrue(s1.getTravelTimeFromPrevSeconds() > 0);
        assertTrue(s2.getTravelTimeFromPrevSeconds() > 0);
    }

    @Test
    @DisplayName("Historical ETA evaluation computes valid MAE and RMSE error metrics")
    void testHistoricalAccuracyEvaluation() {
        EtaAccuracyReportDto report = etaPredictionService.evaluateHistoricalEtaAccuracy();

        assertNotNull(report);
        assertTrue(report.getEvaluatedSamplesCount() > 0);
        assertTrue(report.getMeanAbsoluteErrorMinutes() >= 0.0);
        assertTrue(report.getRootMeanSquaredErrorMinutes() >= 0.0);
        assertTrue(report.getOnTimeDeliveryRatePercentage() > 80.0);
    }
}
