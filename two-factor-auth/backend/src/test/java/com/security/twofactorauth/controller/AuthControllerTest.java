package com.security.twofactorauth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Collections;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.security.twofactorauth.dto.LoginRequest;
import com.security.twofactorauth.dto.SignupRequest;
import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.service.TwoFactorAuthService;
import com.security.twofactorauth.security.jwt.JwtUtils;
import com.security.twofactorauth.security.service.UserDetailsImpl;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private TwoFactorAuthService tfaService;

    @Test
    void testLogin() throws Exception {
        // Create test user and config
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        
        TFAConfig tfaConfig = TFAConfig.createAppConfig(user, "test-secret");

        // Mock authentication
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L, 
            "testuser", 
            "test@example.com", 
            "password",
            true, // enabled
            Collections.emptyList() // authorities
        );
        
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtUtils.generateJwtToken((Authentication) any())).thenReturn("test-token");
        when(tfaService.setupTwoFactorAuth(any(), any())).thenReturn(tfaConfig);

        // Perform login request
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    // Helper method to create Authentication mock
    private Authentication mock(Class<Authentication> clazz) {
        return org.mockito.Mockito.mock(clazz);
    }
}
