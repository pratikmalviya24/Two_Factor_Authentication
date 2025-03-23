package com.security.twofactorauth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.security.twofactorauth.dto.ErrorResponse;
import com.security.twofactorauth.service.EmailDiagnosticService;

@RestController
public class EmailTestController {

    private static final Logger logger = LoggerFactory.getLogger(EmailTestController.class);

    @Autowired
    private EmailDiagnosticService emailDiagnosticService;

    @GetMapping("/api/admin/email/diagnostics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getEmailDiagnostics() {
        String diagnostics = emailDiagnosticService.getEmailDiagnostics();
        return ResponseEntity.ok(diagnostics);
    }

    @PostMapping("/api/admin/email/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendTestEmail(@RequestParam String toEmail) {
        try {
            logger.info("Attempting to send test email to: {}", toEmail);
            boolean success = emailDiagnosticService.sendTestEmail(toEmail);
            
            if (success) {
                logger.info("Test email sent successfully to: {}", toEmail);
                return ResponseEntity.ok("Test email sent successfully");
            } else {
                logger.error("Failed to send test email to: {}", toEmail);
                return ResponseEntity.internalServerError()
                        .body(new ErrorResponse("Failed to send test email. Check server logs for details."));
            }
        } catch (Exception e) {
            logger.error("Error sending test email", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Error sending test email: " + e.getMessage()));
        }
    }

    @GetMapping("/api/admin/email/test-connection")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testEmailConnection() {
        try {
            boolean success = emailDiagnosticService.testEmailConnection();
            if (success) {
                return ResponseEntity.ok("Email connection test successful");
            } else {
                return ResponseEntity.internalServerError()
                        .body(new ErrorResponse("Email connection test failed. Check server logs for details."));
            }
        } catch (Exception e) {
            logger.error("Error testing email connection", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Error testing email connection: " + e.getMessage()));
        }
    }
    
    // Public endpoint that doesn't require authentication for testing email
    @GetMapping("/api/public/email/test")
    public ResponseEntity<?> publicTestEmail(@RequestParam String toEmail) {
        try {
            logger.info("Attempting to send public test email to: {}", toEmail);
            boolean success = emailDiagnosticService.sendTestEmail(toEmail);
            
            if (success) {
                logger.info("Public test email sent successfully to: {}", toEmail);
                return ResponseEntity.ok("Test email sent successfully");
            } else {
                logger.error("Failed to send public test email to: {}", toEmail);
                return ResponseEntity.internalServerError()
                        .body(new ErrorResponse("Failed to send test email. Check server logs for details."));
            }
        } catch (Exception e) {
            logger.error("Error sending public test email", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Error sending test email: " + e.getMessage()));
        }
    }
}
