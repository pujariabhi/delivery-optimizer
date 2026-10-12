package com.delivery.optimizer.dto;

public class EtaAccuracyReportDto {
    private int evaluatedSamplesCount;
    private double meanAbsoluteErrorMinutes;
    private double rootMeanSquaredErrorMinutes;
    private double meanAbsolutePercentageError;
    private double onTimeDeliveryRatePercentage;
    private String modelDescription;

    public EtaAccuracyReportDto() {
    }

    public EtaAccuracyReportDto(int evaluatedSamplesCount, double meanAbsoluteErrorMinutes,
                                double rootMeanSquaredErrorMinutes, double meanAbsolutePercentageError,
                                double onTimeDeliveryRatePercentage, String modelDescription) {
        this.evaluatedSamplesCount = evaluatedSamplesCount;
        this.meanAbsoluteErrorMinutes = meanAbsoluteErrorMinutes;
        this.rootMeanSquaredErrorMinutes = rootMeanSquaredErrorMinutes;
        this.meanAbsolutePercentageError = meanAbsolutePercentageError;
        this.onTimeDeliveryRatePercentage = onTimeDeliveryRatePercentage;
        this.modelDescription = modelDescription;
    }

    public int getEvaluatedSamplesCount() {
        return evaluatedSamplesCount;
    }

    public void setEvaluatedSamplesCount(int evaluatedSamplesCount) {
        this.evaluatedSamplesCount = evaluatedSamplesCount;
    }

    public double getMeanAbsoluteErrorMinutes() {
        return meanAbsoluteErrorMinutes;
    }

    public void setMeanAbsoluteErrorMinutes(double meanAbsoluteErrorMinutes) {
        this.meanAbsoluteErrorMinutes = meanAbsoluteErrorMinutes;
    }

    public double getRootMeanSquaredErrorMinutes() {
        return rootMeanSquaredErrorMinutes;
    }

    public void setRootMeanSquaredErrorMinutes(double rootMeanSquaredErrorMinutes) {
        this.rootMeanSquaredErrorMinutes = rootMeanSquaredErrorMinutes;
    }

    public double getMeanAbsolutePercentageError() {
        return meanAbsolutePercentageError;
    }

    public void setMeanAbsolutePercentageError(double meanAbsolutePercentageError) {
        this.meanAbsolutePercentageError = meanAbsolutePercentageError;
    }

    public double getOnTimeDeliveryRatePercentage() {
        return onTimeDeliveryRatePercentage;
    }

    public void setOnTimeDeliveryRatePercentage(double onTimeDeliveryRatePercentage) {
        this.onTimeDeliveryRatePercentage = onTimeDeliveryRatePercentage;
    }

    public String getModelDescription() {
        return modelDescription;
    }

    public void setModelDescription(String modelDescription) {
        this.modelDescription = modelDescription;
    }
}
