package com.security.twofactorauth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.model.TFAConfig.TFAType;

import dev.samstevens.totp.code.CodeVerifier;

@SpringBootTest
class TwoFactorAuthServiceTest {

    @Autowired
    private TwoFactorAuthService tfaService;

    @MockBean
    private TFAConfigRepository tfaConfigRepository;

    @MockBean
    private JavaMailSender mailSender;

    @Mock
    private CodeVerifier codeVerifier;

    private User testUser;
    private TFAConfig testConfig;
    private static final String TEST_SECRET = "test-secret";
    private static final String TEST_CODE = "123456";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testConfig = TFAConfig.createAppConfig(testUser, TEST_SECRET);
        testConfig.setId(1L);

        // Replace the default CodeVerifier with our mock
        ReflectionTestUtils.setField(tfaService, "verifier", codeVerifier);

        // Set up default mock behavior
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));
        when(codeVerifier.isValidCode(eq(TEST_SECRET), eq(TEST_CODE))).thenReturn(true);
        when(codeVerifier.isValidCode(eq(TEST_SECRET), eq("invalid"))).thenReturn(false);
    }

    @Test
    void testSetupAppBasedTwoFactorAuth() {
        when(tfaConfigRepository.save(any(TFAConfig.class))).thenReturn(testConfig);

        TFAConfig result = tfaService.setupTwoFactorAuth(testUser, TFAType.APP);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(TFAType.APP, result.getTfaType());
        assertNotNull(result.getSecretKey());
        assertNull(result.getTemporaryCode());
        verify(tfaConfigRepository).save(any(TFAConfig.class));
    }

    @Test
    void testSetupEmailBasedTwoFactorAuth() {
        TFAConfig emailConfig = TFAConfig.createEmailConfig(testUser, TEST_SECRET, TEST_CODE);
        emailConfig.setId(1L);

        when(tfaConfigRepository.save(any(TFAConfig.class))).thenReturn(emailConfig);

        TFAConfig result = tfaService.setupTwoFactorAuth(testUser, TFAType.EMAIL);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(TFAType.EMAIL, result.getTfaType());
        assertNotNull(result.getSecretKey());
        assertNotNull(result.getTemporaryCode());
        verify(mailSender).send(any(SimpleMailMessage.class));
        verify(tfaConfigRepository).save(any(TFAConfig.class));
    }

    @Test
    void testVerifyAppBasedCode() {
        when(tfaConfigRepository.findByUser(testUser)).thenReturn(Optional.of(testConfig));

        boolean result = tfaService.verifyTwoFactorAuth(testUser, TEST_CODE);

        assertTrue(result);
        verify(codeVerifier).isValidCode(eq(TEST_SECRET), eq(TEST_CODE));
    }

    @Test
    void testVerifyEmailCode() {
        TFAConfig emailConfig = TFAConfig.createEmailConfig(testUser, TEST_SECRET, TEST_CODE);
        when(tfaConfigRepository.findByUser(testUser)).thenReturn(Optional.of(emailConfig));
        when(tfaConfigRepository.save(any(TFAConfig.class))).thenReturn(emailConfig.withoutTemporaryCode());

        boolean result = tfaService.verifyTwoFactorAuth(testUser, TEST_CODE);

        assertTrue(result);
        verify(tfaConfigRepository).save(emailConfig.withoutTemporaryCode());
    }

    @Test
    void testVerifyInvalidCode() {
        when(tfaConfigRepository.findByUser(testUser)).thenReturn(Optional.of(testConfig));

        boolean result = tfaService.verifyTwoFactorAuth(testUser, "invalid");

        assertFalse(result);
        verify(codeVerifier).isValidCode(eq(TEST_SECRET), eq("invalid"));
    }

    @Test
    void testVerifyNoConfig() {
        when(tfaConfigRepository.findByUser(testUser)).thenReturn(Optional.empty());

        boolean result = tfaService.verifyTwoFactorAuth(testUser, TEST_CODE);

        assertFalse(result);
        verifyNoInteractions(codeVerifier);
    }
}
