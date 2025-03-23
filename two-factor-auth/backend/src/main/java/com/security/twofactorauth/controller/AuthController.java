package com.security.twofactorauth.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.security.twofactorauth.dto.ErrorResponse;
import com.security.twofactorauth.dto.JwtResponse;
import com.security.twofactorauth.dto.LoginRequest;
import com.security.twofactorauth.dto.SignupRequest;
import com.security.twofactorauth.dto.TwoFactorRequest;
import com.security.twofactorauth.dto.UserProfile;
import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.UserRepository;
import com.security.twofactorauth.security.jwt.JwtUtils;
import com.security.twofactorauth.security.service.UserDetailsImpl;
import com.security.twofactorauth.service.CaptchaService;
import com.security.twofactorauth.service.TwoFactorAuthService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    TwoFactorAuthService tfaService;

    @Autowired
    CaptchaService captchaService;

    @Value("${google.recaptcha.site-key}")
    private String recaptchaSiteKey;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Verify CAPTCHA first
        if (!captchaService.verifyCaptcha(signUpRequest.getCaptchaResponse())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("CAPTCHA verification failed. Please try again."));
        }
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Error: Email is already in use!"));
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        // Enable 2FA by default for new users
        user.setTfaEnabled(true);
        user = userRepository.save(user);

        // Set up 2FA configuration
        TFAConfig config = tfaService.setupTwoFactorAuth(user, TFAConfig.TFAType.APP);
        String qrCodeUrl = tfaService.generateOrRetrieveQRCodeUri(user.getUsername(), config);

        return ResponseEntity.ok(JwtResponse.builder()
                .tfaEnabled(true)
                .tfaSetupSecret(qrCodeUrl)
                .username(user.getUsername())
                .tfaType("APP")
                .requiresTwoFactor(true)
                .build());
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Verify CAPTCHA first
            if (!captchaService.verifyCaptcha(loginRequest.getCaptchaResponse())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("CAPTCHA verification failed. Please try again."));
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Try to find by username first, then by email if not found
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseGet(() -> userRepository.findByEmail(userDetails.getUsername())
                            .orElseThrow(() -> new RuntimeException("User not found")));
            
            // Check if user has 2FA enabled
            if (user.isTfaEnabled()) {
                // Get current 2FA configuration
                Optional<TFAConfig> tfaConfig = user.getTfaConfig() != null 
                    ? Optional.of(user.getTfaConfig())
                    : Optional.empty();

                return ResponseEntity.ok(JwtResponse.builder()
                        .requiresTwoFactor(true)
                        .username(userDetails.getUsername())
                        .tfaType(tfaConfig.map(config -> config.getTfaType().toString()).orElse("APP"))
                        .build());
            } else {
                // If 2FA is not enabled, return JWT token directly
                String jwt = jwtUtils.generateJwtToken(authentication);
                return ResponseEntity.ok(JwtResponse.builder()
                        .token(jwt)
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .tfaEnabled(false)
                        .requiresTwoFactor(false)
                        .build());
            }
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid username or password"));
        }
    }

    @PostMapping("/setup-2fa")
    public ResponseEntity<?> setup2FA(@Valid @RequestBody TwoFactorRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                            .orElseThrow(() -> new RuntimeException("User not found")));

            TFAConfig config = tfaService.setupTwoFactorAuth(user, request.getTfaType());
            
            if (request.getTfaType() == TFAConfig.TFAType.APP) {
                String qrCodeUrl = tfaService.generateOrRetrieveQRCodeUri(user.getUsername(), config);
                return ResponseEntity.ok()
                        .body(JwtResponse.builder()
                                .tfaEnabled(true)
                                .tfaSetupSecret(qrCodeUrl)
                                .tfaType("APP")
                                .build());
            }

            return ResponseEntity.ok()
                    .body(JwtResponse.builder()
                            .tfaEnabled(true)
                            .tfaType("EMAIL")
                            .build());
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Failed to send verification code")) {
                return ResponseEntity.status(500)
                        .body(new ErrorResponse("Failed to send verification email. Please try again or choose a different method."));
            }
            throw e;
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactorAuth(@Valid @RequestBody TwoFactorRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found")));

        if (tfaService.verifyTwoFactorAuth(user, request.getCode())) {
            String jwt = jwtUtils.generateJwtToken(request.getUsername());
            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .tfaEnabled(user.isTfaEnabled())
                    .requiresTwoFactor(false)
                    .build());
        }

        return ResponseEntity.badRequest().body(new ErrorResponse("Invalid verification code"));
    }
    
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException e) {
        return ResponseEntity.status(401).body(new ErrorResponse("Invalid username or password"));
    }

    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        userRepository.deleteById(userDetails.getId());
        SecurityContextHolder.clearContext();
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isTfaEnabled()));
    }

    @GetMapping("/captcha-site-key")
    public ResponseEntity<?> getCaptchaSiteKey() {
        Map<String, String> response = new HashMap<>();
        response.put("siteKey", recaptchaSiteKey);
        return ResponseEntity.ok(response);
    }
}
