package com.security.twofactorauth.config;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class EmailConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailConfig.class);

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        logger.info("Initializing JavaMailSender with host: {}, port: {}", host, port);
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.debug", "true");
        
        // Gmail specific timeouts
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        
        // Improve reliability
        props.put("mail.smtp.quitwait", "false");
        props.put("mail.smtp.sendpartial", "true");

        logger.info("JavaMailSender configured with properties: {}", props);

        try {
            logger.info("Testing email connection...");
            mailSender.testConnection();
            logger.info("Successfully tested email connection");
        } catch (Exception e) {
            logger.error("Failed to test email connection. Please check your email settings.", e);
            logger.error("Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                logger.error("Cause: {}", e.getCause().getMessage());
            }
            
            logger.info("Common Gmail issues:");
            logger.info("1. If using Gmail, make sure 'Less secure app access' is enabled or an App Password is used");
            logger.info("2. Verify the App Password is correct and not expired");
            logger.info("3. Check if your account has 2FA enabled (requires App Password)");
            logger.info("4. Ensure port 587 is not blocked by firewall");
            
            // We don't throw the exception as we want the application to start
        }

        return mailSender;
    }
}
