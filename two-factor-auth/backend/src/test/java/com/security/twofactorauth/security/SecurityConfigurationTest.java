package com.security.twofactorauth.security;

import com.security.twofactorauth.dto.LoginRequest;
import com.security.twofactorauth.dto.SignupRequest;
import com.security.twofactorauth.security.jwt.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityConfigurationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtils jwtUtils;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setUsername("testuser");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    void publicEndpoints_ShouldBeAccessibleWithoutAuthentication() throws Exception {
        // Test signup endpoint
        mockMvc.perform(post("/api/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(signupRequest)))
            .andExpect(status().isOk());

        // Test signin endpoint
        mockMvc.perform(post("/api/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk());
    }

    @Test
    void protectedEndpoints_ShouldRequireAuthentication() throws Exception {
        // Test protected endpoint without authentication
        mockMvc.perform(get("/api/auth/profile"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void protectedEndpoints_ShouldBeAccessibleWithAuthentication() throws Exception {
        // Test protected endpoint with mock authentication
        mockMvc.perform(get("/api/auth/profile"))
            .andExpect(status().isOk());
    }

    @Test
    void invalidJwtToken_ShouldBeRejected() throws Exception {
        String invalidToken = "invalid.jwt.token";

        mockMvc.perform(get("/api/auth/profile")
            .header("Authorization", "Bearer " + invalidToken))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void expiredJwtToken_ShouldBeRejected() throws Exception {
        // Create an expired token by setting a very short expiration in test config
        String expiredToken = jwtUtils.generateJwtToken("testuser");
        Thread.sleep(1000); // Wait for token to expire (configured in test properties)

        mockMvc.perform(get("/api/auth/profile")
            .header("Authorization", "Bearer " + expiredToken))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void optionsRequest_ShouldAllowCORS() throws Exception {
        mockMvc.perform(options("/api/auth/signin")
            .header("Access-Control-Request-Method", "POST")
            .header("Origin", "http://localhost:3000"))
            .andExpect(status().isOk())
            .andExpect(header().exists("Access-Control-Allow-Origin"))
            .andExpect(header().exists("Access-Control-Allow-Methods"));
    }

    @Test
    void malformedAuthorizationHeader_ShouldBeRejected() throws Exception {
        // Test without "Bearer" prefix
        mockMvc.perform(get("/api/auth/profile")
            .header("Authorization", "invalid-token"))
            .andExpect(status().isUnauthorized());

        // Test with incorrect format
        mockMvc.perform(get("/api/auth/profile")
            .header("Authorization", "Bearer"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void csrfProtection_ShouldBeDisabledForStatelessAPI() throws Exception {
        // POST request without CSRF token should succeed
        mockMvc.perform(post("/api/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(signupRequest)))
            .andExpect(status().isOk());
    }

    @Test
    void invalidHttpMethod_ShouldBeRejected() throws Exception {
        mockMvc.perform(put("/api/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isMethodNotAllowed());
    }
}
