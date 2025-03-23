package com.security.twofactorauth.controller;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.security.twofactorauth.dto.ErrorResponse;
import com.security.twofactorauth.dto.ForgotPasswordRequest;
import com.security.twofactorauth.dto.PasswordResetRequest;
import com.security.twofactorauth.dto.PasswordUpdateRequest;
import com.security.twofactorauth.service.PasswordResetService;

@RestController
@RequestMapping("/password")
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    @Autowired
    private PasswordResetService passwordResetService;
    
    /**
     * Initiate password reset process for authenticated users
     * 
     * @param authentication Current user authentication
     * @return Success or failure response
     */
    @PostMapping("/reset-request")
    public ResponseEntity<?> requestPasswordReset(Authentication authentication) {
        String username = authentication.getName();
        
        boolean sent = passwordResetService.initiatePasswordReset(username);
        
        if (sent) {
            return ResponseEntity.ok().body(
                    java.util.Map.of("message", "Password reset email sent successfully")
            );
        } else {
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse("Failed to send password reset email. Please try again later.")
            );
        }
    }
    
    /**
     * Initiate password reset process for unauthenticated users
     * 
     * @param request Contains username or email to send reset link to
     * @return Success response even if user doesn't exist (for security)
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            // Log the request for debugging
            logger.info("Password reset requested for username/email: {}", request.getUsername());
            
            boolean result = passwordResetService.initiatePasswordReset(request.getUsername());
            
            if (result) {
                // Always return success even if user doesn't exist (security best practice)
                return ResponseEntity.ok().body(
                        java.util.Map.of("message", "If the username or email exists, a password reset email has been sent.")
                );
            } else {
                // If the service returned false, there was an issue sending the email
                logger.error("Failed to send password reset email for: {}", request.getUsername());
                return ResponseEntity.status(500).body(
                        new ErrorResponse("Failed to send password reset email. Please try again later.")
                );
            }
        } catch (Exception e) {
            // Log the error but still return a generic message
            logger.error("Error processing password reset request: ", e);
            return ResponseEntity.status(500).body(
                    new ErrorResponse("An error occurred while processing your request. Please try again later.")
            );
        }
    }
    
    /**
     * Validate password reset token
     * 
     * @param request Contains token to validate
     * @return Success or failure response
     */
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@Valid @RequestBody PasswordResetRequest request) {
        try {
            String username = passwordResetService.validatePasswordResetToken(request.getToken());
            return ResponseEntity.ok().body(
                    java.util.Map.of("valid", true, "username", username)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );
        }
    }
    
    /**
     * Reset password with token
     * 
     * @param request Contains token and new password
     * @return Success or failure response
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordUpdateRequest request) {
        try {
            boolean success = passwordResetService.resetPassword(
                    request.getToken(), 
                    request.getNewPassword()
            );
            
            if (success) {
                return ResponseEntity.ok().body(
                        java.util.Map.of("message", "Password has been reset successfully")
                );
            } else {
                return ResponseEntity.internalServerError().body(
                        new ErrorResponse("Failed to reset password")
                );
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );
        }
    }
} 