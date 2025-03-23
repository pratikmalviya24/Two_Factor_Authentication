package com.security.twofactorauth.security;

import java.security.Key;
import java.util.Date;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.security.twofactorauth.security.jwt.JwtUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.expiration:86400000}")
    private int jwtExpirationInMs;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    private Key signingKey;
    
    @PostConstruct
    public void init() {
        try {
            // Use the shared key from JwtUtils
            this.signingKey = jwtUtils.getSigningKey();
            logger.info("JwtTokenProvider initialized with shared signing key from JwtUtils");
        } catch (Exception e) {
            // Fallback to a secure key if JwtUtils is not ready
            logger.warn("Could not use JwtUtils key, creating secure signing key: {}", e.getMessage());
            this.signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
    }

    private Key getSigningKey() {
        if (signingKey == null) {
            logger.warn("Signing key was null, reinitializing");
            init();
        }
        return signingKey;
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty");
        }
        return false;
    }
}
