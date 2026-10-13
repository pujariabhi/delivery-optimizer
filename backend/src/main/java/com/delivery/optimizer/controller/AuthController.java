package com.delivery.optimizer.controller;

import com.delivery.optimizer.dto.LoginRequest;
import com.delivery.optimizer.dto.LoginResponse;
import com.delivery.optimizer.dto.OtpRequest;
import com.delivery.optimizer.dto.OtpVerifyRequest;
import com.delivery.optimizer.dto.RegisterRequest;
import com.delivery.optimizer.entity.Role;
import com.delivery.optimizer.entity.User;
import com.delivery.optimizer.repository.UserRepository;
import com.delivery.optimizer.security.JwtTokenProvider;
import com.delivery.optimizer.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and session verification")
public class AuthController {

    /** Emails that always receive ROLE_ADMIN when signing in via OTP. */
    private static final Set<String> ADMIN_EMAILS = Set.of(
            "pujariabhiram06@gmail.com",
            "admin@delivery.com"
    );

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    // -----------------------------------------------------------------------
    // OTP login (Gmail / any email — no password required)
    // -----------------------------------------------------------------------

    @PostMapping("/otp/send")
    @Operation(summary = "Send a 6-digit OTP to the given email address")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody OtpRequest request) {
        String otp = otpService.generateAndStoreOtp(request.getEmail());

        // In demo mode the OTP is always printed to the backend console.
        // Return it in the response body so the frontend can show a "demo toast".
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully. Check the backend console for the code.",
                "demoOtp", otp   // remove this line in production
        ));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and sign in (auto-creates account if new user)")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        boolean valid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP. Please request a new one."));
        }

        // Determine role based on email
        String emailLower = request.getEmail().toLowerCase();
        Role role = ADMIN_EMAILS.contains(emailLower) ? Role.ROLE_ADMIN : Role.ROLE_CUSTOMER;

        // Find or create user
        User user = userRepository.findByEmail(emailLower).orElseGet(() -> {
            // Derive a display name from the email prefix
            String namePart = emailLower.contains("@")
                    ? emailLower.substring(0, emailLower.indexOf('@')) : emailLower;
            String displayName = namePart.substring(0, 1).toUpperCase()
                    + namePart.substring(1).replace(".", " ").replace("_", " ");

            User newUser = new User(
                    displayName,
                    emailLower,
                    passwordEncoder.encode(java.util.UUID.randomUUID().toString()), // random unusable password
                    role
            );
            return userRepository.save(newUser);
        });

        // If the user already exists but is being upgraded to admin, update the role
        if (ADMIN_EMAILS.contains(emailLower) && user.getRole() != Role.ROLE_ADMIN) {
            user.setRole(Role.ROLE_ADMIN);
            userRepository.save(user);
        }

        // Generate JWT directly — no password authentication needed for OTP flow
        String token = tokenProvider.generateTokenForEmail(emailLower, user.getRole().name());

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        ));
    }

    // -----------------------------------------------------------------------
    // Classic password registration (for customers who prefer a password)
    // -----------------------------------------------------------------------

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with email " + request.getEmail() + " already exists."));
        }

        User newUser = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_CUSTOMER
        );
        userRepository.save(newUser);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(
                token,
                newUser.getId(),
                newUser.getName(),
                newUser.getEmail(),
                newUser.getRole().name()
        ));
    }

    // -----------------------------------------------------------------------
    // Classic password login
    // -----------------------------------------------------------------------

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT bearer token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getEmail()));

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        ));
    }

    // -----------------------------------------------------------------------
    // Current user info
    // -----------------------------------------------------------------------

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            Map<String, Object> anonymous = new HashMap<>();
            anonymous.put("authenticated", false);
            anonymous.put("message", "Running in unauthenticated / public demo mode");
            return ResponseEntity.ok(anonymous);
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of("email", email, "role", "ROLE_DISPATCHER"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole().name());
        return ResponseEntity.ok(resp);
    }
}
