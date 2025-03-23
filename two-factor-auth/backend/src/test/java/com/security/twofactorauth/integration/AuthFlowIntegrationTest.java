package com.security.twofactorauth.integration;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.security.twofactorauth.dto.LoginRequest;
import com.security.twofactorauth.dto.SignupRequest;
import com.security.twofactorauth.dto.TwoFactorRequest;
import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.repository.UserRepository;
import com.security.twofactorauth.util.TOTPTestUtil;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TFAConfigRepository tfaConfigRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private TwoFactorRequest tfaRequest;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        tfaConfigRepository.deleteAll();

        signupRequest = new SignupRequest();
        signupRequest.setUsername("testuser");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        tfaRequest = new TwoFactorRequest();
        tfaRequest.setUsername("testuser");
        tfaRequest.setCode("123456");
        tfaRequest.setTfaType(TFAConfig.TFAType.APP);
    }

    @Test
    void testCompleteAuthFlow() throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // Login
        MvcResult loginResult = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.requiresTwoFactor").value(false))
                .andReturn();

        // Setup 2FA
        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        MvcResult setupResult = mockMvc.perform(post("/api/auth/2fa/setup")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tfaRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tfaEnabled").value(true))
                .andExpect(jsonPath("$.tfaSetupSecret").isNotEmpty())
                .andReturn();

        // Get the secret and generate code
        String secret = objectMapper.readTree(setupResult.getResponse().getContentAsString())
                .get("tfaSetupSecret").asText();
        String validCode = TOTPTestUtil.generateTOTPCode(secret);
        tfaRequest.setCode(validCode);

        // Verify 2FA
        mockMvc.perform(post("/api/auth/2fa/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tfaRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void testInvalidTwoFactorCode() throws Exception {
        // Register and setup 2FA first
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        mockMvc.perform(post("/api/auth/2fa/setup")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tfaRequest)))
                .andExpect(status().isOk());

        // Try to verify with invalid code
        tfaRequest.setCode("000000");
        mockMvc.perform(post("/api/auth/2fa/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tfaRequest)))
                .andExpect(status().isBadRequest());
    }
}
