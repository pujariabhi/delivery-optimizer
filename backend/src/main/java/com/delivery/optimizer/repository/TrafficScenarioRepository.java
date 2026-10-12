package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.TrafficScenario;
import com.delivery.optimizer.entity.TrafficType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrafficScenarioRepository extends JpaRepository<TrafficScenario, Long> {
    Optional<TrafficScenario> findByActiveTrue();
    List<TrafficScenario> findByScenarioType(TrafficType scenarioType);
}
