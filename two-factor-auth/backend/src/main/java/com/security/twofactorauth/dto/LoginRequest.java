package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class LoginRequest {
    @NotBlank(message = "Username or email cannot be blank")
    @Size(min = 3, max = 255, message = "Username or email must be between 3 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]{3,50}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
            message = "Must be a valid username or email address")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 120, message = "Invalid password")
    private String password;
    
    @NotBlank(message = "Captcha response cannot be blank")
    private String captchaResponse;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
}
