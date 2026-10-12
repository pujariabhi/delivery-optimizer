package com.delivery.optimizer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DeliveryOptimizerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliveryOptimizerApplication.class, args);
    }
}
