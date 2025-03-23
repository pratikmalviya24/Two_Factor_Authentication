package com.security.twofactorauth.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    @NotBlank(message = "Captcha response cannot be blank")
    private String captchaResponse;
    
    private boolean tfaEnabled = true; // Default to true for backward compatibility

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getCaptchaResponse() {
        return captchaResponse;
    }
    
    public void setCaptchaResponse(String captchaResponse) {
        this.captchaResponse = captchaResponse;
    }
    
    public boolean isTfaEnabled() {
        return tfaEnabled;
    }
    
    public void setTfaEnabled(boolean tfaEnabled) {
        this.tfaEnabled = tfaEnabled;
    }
}
