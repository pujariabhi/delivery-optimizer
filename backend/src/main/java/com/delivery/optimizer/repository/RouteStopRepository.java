package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.RouteStop;
import com.delivery.optimizer.entity.StopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
    List<RouteStop> findByRoutePlanIdOrderByStopSequenceAsc(Long routePlanId);
    List<RouteStop> findByVehicleIdAndStatus(Long vehicleId, StopStatus status);
    List<RouteStop> findByVehicleIdOrderByStopSequenceAsc(Long vehicleId);

    @Query("SELECT s FROM RouteStop s JOIN FETCH s.order JOIN FETCH s.vehicle WHERE s.routePlan.id = :routePlanId ORDER BY s.vehicle.id, s.stopSequence ASC")
    List<RouteStop> findStopsWithDetails(Long routePlanId);
}
