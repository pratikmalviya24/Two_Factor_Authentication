package com.security.twofactorauth.security.jwt;

import java.security.Key;
import java.util.Date;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.security.twofactorauth.security.service.UserDetailsImpl;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;
    
    // Static shared signing key for the entire application
    private static Key SHARED_SIGNING_KEY;

    private Key signingKey;
    
    @PostConstruct
    public void init() {
        if (SHARED_SIGNING_KEY == null) {
            // Generate a secure key for HS512 algorithm if it doesn't exist yet
            SHARED_SIGNING_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            logger.info("Generated new secure signing key for HS512");
        }
        
        this.signingKey = SHARED_SIGNING_KEY;
        logger.info("JwtUtils initialized with shared signing key");
    }
    
    public Key getSigningKey() {
        if (signingKey == null) {
            logger.warn("Signing key was null, reinitializing");
            init();
        }
        return signingKey;
    }

    public String generateJwtToken(Authentication authentication) {
        // Extract the username from the principal, handling both String and UserDetailsImpl cases
        String username;
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetailsImpl) {
            username = ((UserDetailsImpl) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " + principal.getClass());
        }

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
