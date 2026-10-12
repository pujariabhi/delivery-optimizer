-- V1__init_schema.sql
-- Real-Time Traffic-Aware Last-Mile Delivery Optimization Database Schema

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity_kg DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    current_latitude DECIMAL(10, 7) NOT NULL,
    current_longitude DECIMAL(10, 7) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicle_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    package_weight_kg DECIMAL(10, 2) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    time_window_start VARCHAR(20) NULL,
    time_window_end VARCHAR(20) NULL,
    status VARCHAR(50) NOT NULL,
    assigned_vehicle_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_assigned_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles (id) ON DELETE SET NULL,
    INDEX idx_order_status (status),
    INDEX idx_order_priority (priority),
    INDEX idx_order_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    optimization_objective VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_distance_meters BIGINT NOT NULL,
    total_duration_seconds BIGINT NOT NULL,
    baseline_distance_meters BIGINT NOT NULL,
    baseline_duration_seconds BIGINT NOT NULL,
    computation_duration_ms BIGINT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    recalculation_reason VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_plan_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    stop_sequence INT NOT NULL,
    estimated_arrival_time DATETIME NULL,
    actual_arrival_time DATETIME NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stop_route_plan FOREIGN KEY (route_plan_id) REFERENCES route_plans (id) ON DELETE CASCADE,
    CONSTRAINT fk_stop_order FOREIGN KEY (order_id) REFERENCES delivery_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_stop_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
    INDEX idx_stop_route_seq (route_plan_id, stop_sequence),
    INDEX idx_stop_vehicle (vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_location_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
    INDEX idx_vehicle_recorded (vehicle_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS traffic_scenarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    configuration_json TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_traffic_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS optimization_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_plan_id BIGINT NULL,
    algorithm_name VARCHAR(100) NOT NULL,
    input_order_count INT NOT NULL,
    input_vehicle_count INT NOT NULL,
    baseline_distance_meters BIGINT NOT NULL,
    optimized_distance_meters BIGINT NOT NULL,
    baseline_duration_seconds BIGINT NOT NULL,
    optimized_duration_seconds BIGINT NOT NULL,
    computation_duration_ms BIGINT NOT NULL,
    result_status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_run_route_plan FOREIGN KEY (route_plan_id) REFERENCES route_plans (id) ON DELETE SET NULL,
    INDEX idx_run_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
