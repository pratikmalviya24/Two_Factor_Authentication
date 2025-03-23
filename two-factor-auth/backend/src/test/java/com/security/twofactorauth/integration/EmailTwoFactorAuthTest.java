package com.security.twofactorauth.integration;

import com.security.twofactorauth.dto.LoginRequest;
import com.security.twofactorauth.dto.SignupRequest;
import com.security.twofactorauth.dto.TwoFactorRequest;
import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EmailTwoFactorAuthTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TFAConfigRepository tfaConfigRepository;

    @MockBean
    private JavaMailSender emailSender;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "password123";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        tfaConfigRepository.deleteAll();
        doNothing().when(emailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void emailBasedTwoFactorAuth_Success() throws Exception {
        // 1. Register new user
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername(TEST_USERNAME);
        signupRequest.setEmail(TEST_EMAIL);
        signupRequest.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(signupRequest)))
            .andExpect(status().isOk());

        // 2. Setup Email 2FA
        TwoFactorRequest setup2FARequest = new TwoFactorRequest();
        setup2FARequest.setUsername(TEST_USERNAME);
        setup2FARequest.setTfaType(TFAConfig.TFAType.EMAIL);

        mockMvc.perform(post("/api/auth/setup-2fa")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(setup2FARequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tfaEnabled").value(true));

        // Verify that email was sent
        verify(emailSender).send(any(SimpleMailMessage.class));

        // 3. Login to trigger 2FA
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(TEST_USERNAME);
        loginRequest.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requiresTwoFactor").value(true));

        // Verify that second email was sent for login
        verify(emailSender, times(2)).send(any(SimpleMailMessage.class));
    }

    @Test
    void emailBasedTwoFactorAuth_WithInvalidCode_ShouldFail() throws Exception {
        // 1. Register and setup 2FA
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername(TEST_USERNAME);
        signupRequest.setEmail(TEST_EMAIL);
        signupRequest.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(signupRequest)))
            .andExpect(status().isOk());

        TwoFactorRequest setup2FARequest = new TwoFactorRequest();
        setup2FARequest.setUsername(TEST_USERNAME);
        setup2FARequest.setTfaType(TFAConfig.TFAType.EMAIL);

        mockMvc.perform(post("/api/auth/setup-2fa")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(setup2FARequest)))
            .andExpect(status().isOk());

        // 2. Try to verify with invalid code
        TwoFactorRequest verifyRequest = new TwoFactorRequest();
        verifyRequest.setUsername(TEST_USERNAME);
        verifyRequest.setCode("000000");

        mockMvc.perform(post("/api/auth/verify-2fa")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(verifyRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotSendEmailForAppBasedTwoFactorAuth() throws Exception {
        // 1. Register new user
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername(TEST_USERNAME);
        signupRequest.setEmail(TEST_EMAIL);
        signupRequest.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(signupRequest)))
            .andExpect(status().isOk());

        // 2. Setup App-based 2FA
        TwoFactorRequest setup2FARequest = new TwoFactorRequest();
        setup2FARequest.setUsername(TEST_USERNAME);
        setup2FARequest.setTfaType(TFAConfig.TFAType.APP);

        mockMvc.perform(post("/api/auth/setup-2fa")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(setup2FARequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tfaEnabled").value(true))
            .andExpect(jsonPath("$.tfaSetupSecret").exists());

        // Verify that no email was sent
        verify(emailSender, never()).send(any(SimpleMailMessage.class));
    }
}
