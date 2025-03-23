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

import com.security.twofactorauth.service.EmailDiagnosticService;
import com.security.twofactorauth.dto.ErrorResponse;

@RestController
@PreAuthorize("hasRole('ADMIN')")
public class EmailTestController {

    private static final Logger logger = LoggerFactory.getLogger(EmailTestController.class);

    @Autowired
    private EmailDiagnosticService emailDiagnosticService;

    @GetMapping("/api/admin/email/config")
    public ResponseEntity<?> getEmailConfiguration() {
        try {
            String diagnostics = emailDiagnosticService.getEmailDiagnostics();
            return ResponseEntity.ok(diagnostics);
        } catch (Exception e) {
            logger.error("Error getting email configuration", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Error getting email configuration: " + e.getMessage()));
        }
    }

    @PostMapping("/api/admin/email/test")
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
}
