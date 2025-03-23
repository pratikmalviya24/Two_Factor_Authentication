package com.security.twofactorauth.security.jwt;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import com.security.twofactorauth.security.service.UserDetailsImpl;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;

/**
 * Tests for JWT utility functions.
 * 
 * Tests JWT token generation, validation, and parsing
 * with various scenarios including:
 * - Valid token generation
 * - Token validation
 * - Username extraction
 * - Expired tokens
 * - Invalid tokens
 */
public class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private UserDetailsImpl userDetails;
    private Authentication authentication;
    private final int jwtExpirationMs = 1000; // 1 second for testing

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", jwtExpirationMs);

        userDetails = new UserDetailsImpl(
            1L,
            "testuser",
            "test@example.com",
            "password",
            false,
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
        );

        authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
    }

    @Test
    void generateJwtToken_ValidAuthentication_ShouldGenerateToken() {
        String token = jwtUtils.generateJwtToken(authentication);

        assertNotNull(token);
        assertTrue(token.length() > 0);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void generateJwtToken_FromUsername_ShouldGenerateToken() {
        String token = jwtUtils.generateJwtToken("testuser");

        assertNotNull(token);
        assertTrue(token.length() > 0);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void validateJwtToken_WithExpiredToken_ShouldReturnFalse() throws InterruptedException {
        String token = jwtUtils.generateJwtToken("testuser");
        Thread.sleep(jwtExpirationMs + 100); // Wait for token to expire

        assertFalse(jwtUtils.validateJwtToken(token));
        assertThrows(ExpiredJwtException.class, () -> jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void validateJwtToken_WithInvalidToken_ShouldReturnFalse() {
        String invalidToken = "invalid.jwt.token";
        assertFalse(jwtUtils.validateJwtToken(invalidToken));
        assertThrows(SignatureException.class, () -> jwtUtils.getUserNameFromJwtToken(invalidToken));
    }

    @Test
    void validateJwtToken_WithEmptyToken_ShouldReturnFalse() {
        assertFalse(jwtUtils.validateJwtToken(""));
        assertThrows(IllegalArgumentException.class, () -> jwtUtils.getUserNameFromJwtToken(""));
    }

    @Test
    void validateJwtToken_WithNullToken_ShouldReturnFalse() {
        assertFalse(jwtUtils.validateJwtToken(null));
        assertThrows(IllegalArgumentException.class, () -> jwtUtils.getUserNameFromJwtToken(null));
    }

    @Test
    void validateJwtToken_WithMalformedToken_ShouldReturnFalse() {
        String malformedToken = "not.three.parts";
        assertFalse(jwtUtils.validateJwtToken(malformedToken));
        assertThrows(MalformedJwtException.class, () -> jwtUtils.getUserNameFromJwtToken(malformedToken));
    }

    @Test
    void getUserNameFromJwtToken_ValidToken_ShouldReturnUsername() {
        String token = jwtUtils.generateJwtToken("testuser");
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void getUserNameFromJwtToken_InvalidToken_ShouldThrowException() {
        String invalidToken = "invalid.jwt.token";
        Exception exception = assertThrows(SignatureException.class, 
            () -> jwtUtils.getUserNameFromJwtToken(invalidToken));
        assertTrue(exception.getMessage().contains("JWT signature"));
    }
}
