package com.security.twofactorauth.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.TestPropertySource;
import java.util.Properties;

@TestConfiguration
@TestPropertySource(properties = {
    "spring.mail.host=localhost",
    "spring.mail.port=3025",
    "spring.mail.username=test",
    "spring.mail.password=test",
    "spring.mail.properties.mail.smtp.auth=false",
    "spring.mail.properties.mail.smtp.starttls.enable=false"
})
public class TestMailConfig {

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("localhost");
        mailSender.setPort(3025);
        mailSender.setUsername("test");
        mailSender.setPassword("test");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "true");

        return mailSender;
    }

    @Bean
    @Primary
    public Properties mailProperties() {
        Properties properties = new Properties();
        properties.setProperty("mail.transport.protocol", "smtp");
        properties.setProperty("mail.smtp.auth", "false");
        properties.setProperty("mail.smtp.starttls.enable", "false");
        properties.setProperty("mail.debug", "true");
        return properties;
    }
}
