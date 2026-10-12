package com.delivery.optimizer.service;

import com.delivery.optimizer.dto.AnalyticsSummaryDto;
import com.delivery.optimizer.entity.OptimizationRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnalyticsService {
    AnalyticsSummaryDto getAnalyticsSummary();
    Page<OptimizationRun> getOptimizationRuns(Pageable pageable);
}
