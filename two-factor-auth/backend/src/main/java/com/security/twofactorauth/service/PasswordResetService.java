package com.security.twofactorauth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.security.twofactorauth.exception.ResourceNotFoundException;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    
    // Token expiration time in minutes
    private static final int TOKEN_EXPIRATION_MINUTES = 30;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    @Value("${app.url.frontend}")
    private String frontendUrl;
    
    // Store tokens with expiration time
    private final java.util.Map<String, PasswordResetToken> tokenStore = new java.util.HashMap<>();
    
    /**
     * Inner class to store token information
     */
    private static class PasswordResetToken {
        private final String username;
        private final LocalDateTime expiryDate;
        
        public PasswordResetToken(String username) {
            this.username = username;
            this.expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES);
        }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryDate);
        }
        
        public String getUsername() {
            return username;
        }
    }
    
    /**
     * Initiates the password reset process for a user
     * 
     * @param username the username or email of the user
     * @return true if reset email was sent, false otherwise
     */
    public boolean initiatePasswordReset(String username) {
        // Try to find by username first
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        // If not found by username, try by email
        if (user == null) {
            user = userRepository.findByEmail(username)
                    .orElse(null);
        }
        
        // If user not found, we return true but don't send email
        // This prevents username enumeration attacks
        if (user == null) {
            logger.warn("Password reset requested for non-existent user: {}", username);
            return true;
        }
        
        // Generate a secure random token
        String token = UUID.randomUUID().toString();
        
        // Store token with username and expiration
        tokenStore.put(token, new PasswordResetToken(user.getUsername()));
        
        // Send email with reset link
        return sendPasswordResetEmail(user.getEmail(), token);
    }
    
    /**
     * Send password reset email to the user
     * 
     * @param email the email address to send to
     * @param token the reset token
     * @return true if email sent successfully, false otherwise
     */
    private boolean sendPasswordResetEmail(String email, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            message.setText("Hello,\n\n" +
                "You have requested to reset your password.\n\n" +
                "Please click on the following link to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in " + TOKEN_EXPIRATION_MINUTES + " minutes.\n\n" +
                "If you did not request a password reset, please ignore this email or contact support.\n\n" +
                "Regards,\nThe Security Team");
            
            mailSender.send(message);
            logger.info("Password reset email sent to: {}", email);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", email, e);
            return false;
        }
    }
    
    /**
     * Validate a password reset token
     * 
     * @param token the token to validate
     * @return the username associated with the token if valid
     * @throws IllegalArgumentException if token is invalid or expired
     */
    public String validatePasswordResetToken(String token) {
        PasswordResetToken resetToken = tokenStore.get(token);
        
        if (resetToken == null) {
            throw new IllegalArgumentException("Invalid password reset token");
        }
        
        if (resetToken.isExpired()) {
            tokenStore.remove(token);
            throw new IllegalArgumentException("Password reset token has expired");
        }
        
        return resetToken.getUsername();
    }
    
    /**
     * Complete the password reset process by changing the user's password
     * 
     * @param token the reset token
     * @param newPassword the new password
     * @return true if password was reset successfully
     * @throws IllegalArgumentException if token is invalid or expired
     */
    public boolean resetPassword(String token, String newPassword) {
        String username = validatePasswordResetToken(token);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        // Update the password with encoded version
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Remove the used token
        tokenStore.remove(token);
        
        logger.info("Password reset successfully for user: {}", username);
        return true;
    }
} 