package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.RoutePlan;
import com.delivery.optimizer.entity.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutePlanRepository extends JpaRepository<RoutePlan, Long> {
    List<RoutePlan> findByStatus(RouteStatus status);
    Optional<RoutePlan> findFirstByStatusOrderByCreatedAtDesc(RouteStatus status);
    Optional<RoutePlan> findFirstByOrderByCreatedAtDesc();

    @Query("SELECT r FROM RoutePlan r LEFT JOIN FETCH r.stops s LEFT JOIN FETCH s.order LEFT JOIN FETCH s.vehicle WHERE r.id = :id")
    Optional<RoutePlan> findByIdWithStops(Long id);
}
