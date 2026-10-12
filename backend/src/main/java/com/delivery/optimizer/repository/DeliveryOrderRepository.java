package com.delivery.optimizer.repository;

import com.delivery.optimizer.entity.DeliveryOrder;
import com.delivery.optimizer.entity.OrderPriority;
import com.delivery.optimizer.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    Optional<DeliveryOrder> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);
    List<DeliveryOrder> findByStatus(OrderStatus status);
    List<DeliveryOrder> findByStatusIn(List<OrderStatus> statuses);
    long countByStatus(OrderStatus status);

    @Query("SELECT o FROM DeliveryOrder o WHERE " +
           "(:query IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(o.deliveryAddress) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:priority IS NULL OR o.priority = :priority)")
    Page<DeliveryOrder> searchOrders(@Param("query") String query,
                                     @Param("status") OrderStatus status,
                                     @Param("priority") OrderPriority priority,
                                     Pageable pageable);
}
