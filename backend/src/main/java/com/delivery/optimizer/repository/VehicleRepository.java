package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.Vehicle;
import com.delivery.optimizer.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByStatusIn(List<VehicleStatus> statuses);
    long countByStatus(VehicleStatus status);
}
