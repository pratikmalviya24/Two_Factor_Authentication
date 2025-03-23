package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;

public class PasswordResetRequest {
    @NotBlank
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
} 