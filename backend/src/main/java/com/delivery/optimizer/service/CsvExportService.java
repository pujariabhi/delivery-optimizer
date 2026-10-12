package com.delivery.optimizer.service;

import java.io.PrintWriter;

public interface CsvExportService {
    void exportOrdersCsv(PrintWriter writer);
    void exportRoutesCsv(PrintWriter writer);
}
