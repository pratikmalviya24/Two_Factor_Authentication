package com.security.twofactorauth;

import com.security.twofactorauth.config.TestMailConfig;
import com.security.twofactorauth.config.TestSecurityConfig;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.repository.UserRepository;
import com.security.twofactorauth.security.jwt.JwtUtils;
import com.security.twofactorauth.service.TwoFactorAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@ContextConfiguration(classes = {
    TestSecurityConfig.class,
    TestMailConfig.class
})
class TwoFactorAuthApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void contextLoads() {
        assertNotNull(applicationContext);
    }

    @Test
    void allRequiredBeansArePresent() {
        // Security components
        assertNotNull(applicationContext.getBean(AuthenticationManager.class));
        assertNotNull(applicationContext.getBean(PasswordEncoder.class));
        assertNotNull(applicationContext.getBean(JwtUtils.class));

        // Repositories
        assertNotNull(applicationContext.getBean(UserRepository.class));
        assertNotNull(applicationContext.getBean(TFAConfigRepository.class));

        // Services
        assertNotNull(applicationContext.getBean(TwoFactorAuthService.class));
        assertNotNull(applicationContext.getBean(JavaMailSender.class));

        // Database
        assertNotNull(applicationContext.getBean(DataSource.class));
    }

    @Test
    void testProfileIsActive() {
        assertTrue(applicationContext.getEnvironment().matchesProfiles("test"));
    }

    @Test
    void securityConfigurationIsCorrect() {
        PasswordEncoder passwordEncoder = applicationContext.getBean(PasswordEncoder.class);
        String encodedPassword = passwordEncoder.encode("testPassword");
        
        assertTrue(passwordEncoder.matches("testPassword", encodedPassword));
        assertFalse(passwordEncoder.matches("wrongPassword", encodedPassword));
    }

    @Test
    void jwtConfigurationIsCorrect() {
        JwtUtils jwtUtils = applicationContext.getBean(JwtUtils.class);
        String token = jwtUtils.generateJwtToken("testuser");
        
        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void mailConfigurationIsCorrect() {
        JavaMailSender mailSender = applicationContext.getBean(JavaMailSender.class);
        assertNotNull(mailSender);
        
        // Verify test configuration
        assertEquals("localhost", ((org.springframework.mail.javamail.JavaMailSenderImpl) mailSender).getHost());
        assertEquals(3025, ((org.springframework.mail.javamail.JavaMailSenderImpl) mailSender).getPort());
    }

    @Test
    void databaseConfigurationIsCorrect() {
        DataSource dataSource = applicationContext.getBean(DataSource.class);
        assertTrue(dataSource.toString().contains("jdbc:h2:mem:testdb"));
    }
}
