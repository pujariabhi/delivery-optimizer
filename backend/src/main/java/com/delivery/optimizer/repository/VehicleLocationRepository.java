package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.VehicleLocation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long> {
    List<VehicleLocation> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId, Pageable pageable);

    @Query("SELECT vl FROM VehicleLocation vl WHERE vl.vehicle.id = :vehicleId ORDER BY vl.recordedAt DESC LIMIT 1")
    Optional<VehicleLocation> findLatestByVehicleId(Long vehicleId);
}
