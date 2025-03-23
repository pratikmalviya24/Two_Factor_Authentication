package com.security.twofactorauth.service;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailDiagnosticService {

    private static final Logger logger = LoggerFactory.getLogger(EmailDiagnosticService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${app.mail.from}")
    private String fromEmail;

    public boolean testEmailConnection() {
        logger.info("Testing email connection with following configuration:");
        logger.info("Host: {}", host);
        logger.info("Port: {}", port);
        logger.info("Username: {}", username);
        
        try {
            JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
            Properties props = mailSenderImpl.getJavaMailProperties();
            logger.info("Mail properties: {}", props);

            // Attempt to connect
            mailSenderImpl.testConnection();
            logger.info("Connection test successful");
            return true;
        } catch (Exception e) {
            logger.error("Failed to connect to SMTP server", e);
            logger.error("Error message: {}", e.getMessage());
            logger.error("Root cause: ", e.getCause());
            return false;
        }
    }

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000;
    private static final double BACKOFF_MULTIPLIER = 2.0;

    public boolean sendTestEmail(String toEmail) {
        int attempts = 0;
        Exception lastException = null;
        long retryDelay = INITIAL_RETRY_DELAY_MS;

        while (attempts < MAX_RETRIES) {
            try {
                if (attempts > 0) {
                    logger.info("Retry attempt {} for sending email to: {} (waiting {}ms)", 
                              attempts, toEmail, retryDelay);
                    Thread.sleep(retryDelay);
                    // Exponential backoff for next retry
                    retryDelay = (long) (retryDelay * BACKOFF_MULTIPLIER);
                }

                logger.info("Sending test email to: {} (Attempt: {})", toEmail, attempts + 1);
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Two-Factor Authentication Test Email");
                message.setText("This is a test email from the Two-Factor Authentication system.\n\n" +
                              "If you received this email, the email configuration is working correctly.\n\n" +
                              "Attempt: " + (attempts + 1));
                
                mailSender.send(message);
                logger.info("Test email sent successfully to: {} on attempt {}", toEmail, attempts + 1);
                return true;
            } catch (Exception e) {
                lastException = e;
                logger.warn("Attempt {} failed to send email to: {}, Error: {}", 
                           attempts + 1, toEmail, e.getMessage());
                attempts++;
                
                // If it's the last attempt, log the full error
                if (attempts == MAX_RETRIES) {
                    logger.error("All {} attempts failed to send email to: {}", MAX_RETRIES, toEmail, e);
                }
            }
        }

        // If we get here, all retries failed
        logger.error("Failed to send email after {} attempts. Last error: {}", 
                    MAX_RETRIES, lastException.getMessage());
        return false;
    }

    public String getEmailDiagnostics() {
        StringBuilder diagnostics = new StringBuilder();
        diagnostics.append("Email Configuration Diagnostics:\n");
        diagnostics.append("==============================\n");
        diagnostics.append(String.format("SMTP Host: %s\n", host));
        diagnostics.append(String.format("SMTP Port: %d\n", port));
        diagnostics.append(String.format("Username: %s\n", username));
        diagnostics.append(String.format("From Email: %s\n", fromEmail));
        diagnostics.append("Password: [PROTECTED]\n");
        
        // Get JavaMail properties
        JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
        Properties props = mailSenderImpl.getJavaMailProperties();
        
        diagnostics.append("\nJavaMail Properties:\n");
        diagnostics.append("==================\n");
        props.stringPropertyNames().stream()
             .filter(key -> !key.contains("password"))
             .sorted()
             .forEach(key -> diagnostics.append(String.format("%s: %s\n", key, props.getProperty(key))));
        
        boolean testResult = testEmailConnection();
        diagnostics.append("\nConnection Test Result: ").append(testResult ? "SUCCESS" : "FAILED");
        
        if (!testResult) {
            diagnostics.append("\n\nTroubleshooting Tips:");
            diagnostics.append("\n1. Check if password is correct");
            diagnostics.append("\n2. Enable 'Less secure app access' in Gmail settings");
            diagnostics.append("\n3. Use App Password if 2FA is enabled on Gmail account");
            diagnostics.append("\n4. Check if SMTP port 587 is not blocked");
            diagnostics.append("\n5. Verify network connectivity to smtp.gmail.com");
            diagnostics.append("\n6. Check system firewall settings");
            diagnostics.append("\n7. Ensure no antivirus is blocking SMTP traffic");
        }
        
        return diagnostics.toString();
    }
}
