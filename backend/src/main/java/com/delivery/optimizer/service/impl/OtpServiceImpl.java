package com.delivery.optimizer.service.impl;

import com.delivery.optimizer.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    private static final long OTP_TTL_SECONDS = 300; // 5 minutes
    private static final SecureRandom RANDOM = new SecureRandom();

    // email -> OtpEntry
    private final ConcurrentHashMap<String, OtpEntry> store = new ConcurrentHashMap<>();

    private static class OtpEntry {
        final String otp;
        final Instant expiry;

        OtpEntry(String otp) {
            this.otp = otp;
            this.expiry = Instant.now().plusSeconds(OTP_TTL_SECONDS);
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiry);
        }
    }

    @Override
    public String generateAndStoreOtp(String email) {
        // Generate 6-digit OTP (with leading-zero support)
        int raw = RANDOM.nextInt(1_000_000);
        String otp = String.format("%06d", raw);

        store.put(email.toLowerCase(), new OtpEntry(otp));

        // Always log OTP to console (demo mode — no SMTP required)
        log.info("==========================================================");
        log.info("  OTP for {} : {}  (valid 5 minutes)", email, otp);
        log.info("==========================================================");

        return otp;
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        String key = email.toLowerCase();
        OtpEntry entry = store.get(key);

        if (entry == null) {
            log.warn("OTP verify: no OTP found for {}", email);
            return false;
        }
        if (entry.isExpired()) {
            store.remove(key);
            log.warn("OTP verify: OTP expired for {}", email);
            return false;
        }
        if (!entry.otp.equals(otp)) {
            log.warn("OTP verify: wrong OTP for {}", email);
            return false;
        }

        // Valid — clear it so it cannot be reused
        store.remove(key);
        log.info("OTP verify: SUCCESS for {}", email);
        return true;
    }
}
