package com.security.twofactorauth.service;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.TestPropertySource;

@TestConfiguration
@TestPropertySource(properties = {
    "app.tfa.issuer=TestIssuer",
    "app.tfa.timeStep=30",
    "app.tfa.codeLength=6",
    "app.tfa.validationWindow=1"
})
public class TwoFactorAuthServiceTestConfig {

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("localhost");
        mailSender.setPort(3025); // Test SMTP port
        return mailSender;
    }
}
