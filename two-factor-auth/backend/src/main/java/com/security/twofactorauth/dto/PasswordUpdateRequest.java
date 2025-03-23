package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class PasswordUpdateRequest {
    @NotBlank
    private String token;
    
    @NotBlank
    @Size(min = 8, max = 120)
    private String newPassword;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
} 