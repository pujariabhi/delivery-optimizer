package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.entity.DeliveryOrder;
import com.delivery.optimizer.entity.RoutePlan;
import com.delivery.optimizer.entity.RouteStop;
import com.delivery.optimizer.repository.DeliveryOrderRepository;
import com.delivery.optimizer.repository.RoutePlanRepository;
import com.delivery.optimizer.repository.RouteStopRepository;
import com.delivery.optimizer.service.CsvExportService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@Service
public class CsvExportServiceImpl implements CsvExportService {

    private static final Logger log = LoggerFactory.getLogger(CsvExportServiceImpl.class);

    private final DeliveryOrderRepository orderRepository;
    private final RoutePlanRepository routePlanRepository;
    private final RouteStopRepository routeStopRepository;

    public CsvExportServiceImpl(DeliveryOrderRepository orderRepository,
                                RoutePlanRepository routePlanRepository,
                                RouteStopRepository routeStopRepository) {
        this.orderRepository = orderRepository;
        this.routePlanRepository = routePlanRepository;
        this.routeStopRepository = routeStopRepository;
    }

    @Override
    public void exportOrdersCsv(PrintWriter writer) {
        List<DeliveryOrder> orders = orderRepository.findAll();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                .setHeader("Order Number", "Customer Name", "Delivery Address", "Latitude", "Longitude",
                        "Package Weight (kg)", "Priority", "Status", "Assigned Vehicle", "Created At")
                .build())) {

            for (DeliveryOrder o : orders) {
                printer.printRecord(
                        o.getOrderNumber(),
                        o.getCustomerName(),
                        o.getDeliveryAddress(),
                        o.getLatitude(),
                        o.getLongitude(),
                        o.getPackageWeightKg(),
                        o.getPriority(),
                        o.getStatus(),
                        o.getAssignedVehicle() != null ? o.getAssignedVehicle().getRegistrationNumber() : "UNASSIGNED",
                        o.getCreatedAt()
                );
            }
            printer.flush();
        } catch (IOException e) {
            log.error("Failed to export orders CSV: ", e);
            throw new RuntimeException("Error generating orders CSV report", e);
        }
    }

    @Override
    public void exportRoutesCsv(PrintWriter writer) {
        List<RoutePlan> plans = routePlanRepository.findAll();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                .setHeader("Plan ID", "Plan Name", "Objective", "Total Distance (m)", "Total Duration (s)",
                        "Vehicle", "Stop Sequence", "Order Number", "Customer", "Stop Status", "Estimated Arrival")
                .build())) {

            for (RoutePlan p : plans) {
                List<RouteStop> stops = routeStopRepository.findStopsWithDetails(p.getId());
                if (stops.isEmpty()) {
                    printer.printRecord(
                            p.getId(), p.getName(), p.getOptimizationObjective(),
                            p.getTotalDistanceMeters(), p.getTotalDurationSeconds(),
                            "N/A", "-", "-", "-", "-", "-"
                    );
                } else {
                    for (RouteStop s : stops) {
                        printer.printRecord(
                                p.getId(),
                                p.getName(),
                                p.getOptimizationObjective(),
                                p.getTotalDistanceMeters(),
                                p.getTotalDurationSeconds(),
                                s.getVehicle().getRegistrationNumber(),
                                s.getStopSequence(),
                                s.getOrder().getOrderNumber(),
                                s.getOrder().getCustomerName(),
                                s.getStatus(),
                                s.getEstimatedArrivalTime()
                        );
                    }
                }
            }
            printer.flush();
        } catch (IOException e) {
            log.error("Failed to export routes CSV: ", e);
            throw new RuntimeException("Error generating routes CSV report", e);
        }
    }
}
