package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;

public class ForgotPasswordRequest {
    @NotBlank
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
} 