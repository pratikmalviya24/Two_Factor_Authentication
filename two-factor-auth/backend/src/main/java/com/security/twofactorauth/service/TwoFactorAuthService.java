package com.security.twofactorauth.service;

import java.security.SecureRandom;
import java.util.Optional;

import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.TFAConfig.TFAType;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.repository.UserRepository;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;

@Service
public class TwoFactorAuthService {

    private static final Logger logger = LoggerFactory.getLogger(TwoFactorAuthService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TFAConfigRepository tfaConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.tfa.issuer:TwoFactorAuth}")
    private String issuer;

    @Value("${app.mail.from:noreply@twofactorauth.com}")
    private String mailFrom;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public TFAConfig setupTwoFactorAuth(User user, TFAType type) {
        // Reload user from database to ensure we have the latest state
        user = userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        
        String secret = secretGenerator.generate();
        TFAConfig config;

        Optional<TFAConfig> existingConfig = tfaConfigRepository.findByUser(user);
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
            if (config.getTfaType() == type) {
                if (type == TFAType.APP && config.getQrCodeUri() != null) {
                    // Return existing APP config with QR code
                    return config;
                }
            }
            // Update existing config with new type and details
            config.setTfaType(type);
            config.setSecretKey(secret);
            if (type == TFAType.EMAIL) {
                String code = generateEmailCode();
                config.setTemporaryCode(code);
                config.setQrCodeUri(null); // Clear QR code if switching to email
                sendVerificationEmail(user.getEmail(), code);
            } else {
                config.setTemporaryCode(null);
                // QR code will be generated when requested
            }
        } else {
            // Create new config if none exists
            if (type == TFAType.EMAIL) {
                String code = generateEmailCode();
                config = TFAConfig.createEmailConfig(user, secret, code);
                sendVerificationEmail(user.getEmail(), code);
            } else {
                config = TFAConfig.createAppConfig(user, secret);
            }
        }

        return tfaConfigRepository.save(config);
    }

    public String generateOrRetrieveQRCodeUri(String username, TFAConfig config) {
        if (config.getQrCodeUri() != null) {
            logger.info("Returning existing QR code URI for user: {}", username);
            return config.getQrCodeUri();
        }

        try {
            QrData data = new QrData.Builder()
                .label(username)
                .secret(config.getSecretKey())
                .issuer(issuer)
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

            QrGenerator generator = new ZxingPngQrGenerator();
            byte[] imageData = generator.generate(data);
            String qrCodeImage = Utils.getDataUriForImage(imageData, generator.getImageMimeType());
            
            String uri = data.getUri();
            config.setQrCodeUri(uri);
            tfaConfigRepository.save(config);
            logger.info("Generated and stored new QR code URI for user: {}", username);
            
            return uri;
        } catch (Exception e) {
            logger.error("Error generating QR code: {}", e.getMessage());
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    @Transactional
    public boolean verifyTwoFactorAuth(User user, String code) {
        Optional<TFAConfig> configOpt = tfaConfigRepository.findByUser(user);
        if (configOpt.isEmpty()) {
            logger.warn("No TFA configuration found for user: {}", user.getUsername());
            return false;
        }

        TFAConfig config = configOpt.get();

        if (config.getTfaType() == TFAType.EMAIL) {
            boolean isValid = code.equals(config.getTemporaryCode());
            if (isValid) {
                logger.info("Valid email code provided for user: {}", user.getUsername());
                tfaConfigRepository.save(config.withoutTemporaryCode());
            } else {
                logger.warn("Invalid email code provided for user: {}", user.getUsername());
            }
            return isValid;
        } else {
            try {
                boolean isValid = verifier.isValidCode(config.getSecretKey(), code);
                if (isValid) {
                    logger.info("Valid TOTP code provided for user: {}", user.getUsername());
                } else {
                    logger.warn("Invalid TOTP code provided for user: {}", user.getUsername());
                }
                return isValid;
            } catch (Exception e) {
                logger.error("Error validating TOTP code: {}", e.getMessage());
                return false;
            }
        }
    }

    private String generateEmailCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000;
    private static final double BACKOFF_MULTIPLIER = 2.0;

    private void sendVerificationEmail(String toEmail, String code) {
        int attempts = 0;
        Exception lastException = null;
        long retryDelay = INITIAL_RETRY_DELAY_MS;

        while (attempts < MAX_RETRIES) {
            try {
                if (attempts > 0) {
                    logger.info("Retry attempt {} for sending verification email to: {} (waiting {}ms)", 
                              attempts, toEmail, retryDelay);
                    Thread.sleep(retryDelay);
                    // Exponential backoff for next retry
                    retryDelay = (long) (retryDelay * BACKOFF_MULTIPLIER);
                }

                logger.info("Sending verification email to: {} (Attempt: {})", toEmail, attempts + 1);
                sendEmail(toEmail, code, attempts + 1);
                logger.info("Successfully sent verification email to: {} on attempt {}", toEmail, attempts + 1);
                return;

            } catch (Exception e) {
                lastException = e;
                logger.warn("Attempt {} failed to send verification email to: {}, Error: {}", 
                           attempts + 1, toEmail, e.getMessage());
                attempts++;
                
                // If it's the last attempt, log the full error
                if (attempts == MAX_RETRIES) {
                    logger.error("All {} attempts failed to send verification email to: {}", MAX_RETRIES, toEmail, e);
                }
            }
        }

        // If we get here, all retries failed
        logger.error("Failed to send verification email after {} attempts. Last error: {}", 
                    MAX_RETRIES, lastException.getMessage());
        throw new RuntimeException("Failed to send verification code after multiple attempts. Please try again later.", lastException);
    }

    private void sendEmail(String toEmail, String code, int attemptNumber) throws Exception {
        logger.debug("Using from address: {}", mailFrom);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject("Two-Factor Authentication Code");
            String htmlContent = String.format(
                "<html><body>" +
                "<h2>Your Verification Code</h2>" +
                "<p>Your verification code is: <strong>%s</strong></p>" +
                "<p>This code will expire after use.</p>" +
                "<p>If you did not request this code, please ignore this email.</p>" +
                "<p>Note: This is attempt %d of %d.</p>" +
                "</body></html>",
                code,
                attemptNumber,
                MAX_RETRIES
            );
            helper.setText(htmlContent, true);

            logger.debug("Mail message prepared, attempting to send...");
            mailSender.send(mimeMessage);
            logger.info("Email successfully sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email: {}", e.getMessage());
            if (e.getCause() != null) {
                logger.error("Cause: {}", e.getCause().getMessage());
            }
            throw e;
        }
    }
}
