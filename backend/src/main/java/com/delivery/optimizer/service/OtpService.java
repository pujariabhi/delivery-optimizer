package com.delivery.optimizer.service;

public interface OtpService {
    /**
     * Generate a 6-digit OTP for the given email, store it with a 5-minute TTL,
     * and return the OTP string (so it can be logged or emailed).
     */
    String generateAndStoreOtp(String email);

    /**
     * Verify whether the provided OTP matches the stored one for this email.
     * Returns true if valid and not expired, false otherwise. Clears OTP on success.
     */
    boolean verifyOtp(String email, String otp);
}
