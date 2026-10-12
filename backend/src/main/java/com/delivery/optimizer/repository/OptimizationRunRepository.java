package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.OptimizationRun;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationRunRepository extends JpaRepository<OptimizationRun, Long> {
    List<OptimizationRun> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT AVG((CAST(r.baselineDistanceMeters AS double) - CAST(r.optimizedDistanceMeters AS double)) / NULLIF(CAST(r.baselineDistanceMeters AS double), 0) * 100.0) FROM OptimizationRun r WHERE r.resultStatus = 'SUCCESS'")
    Double findAverageDistanceImprovementPercentage();

    @Query("SELECT AVG((CAST(r.baselineDurationSeconds AS double) - CAST(r.optimizedDurationSeconds AS double)) / NULLIF(CAST(r.baselineDurationSeconds AS double), 0) * 100.0) FROM OptimizationRun r WHERE r.resultStatus = 'SUCCESS'")
    Double findAverageDurationImprovementPercentage();
}
