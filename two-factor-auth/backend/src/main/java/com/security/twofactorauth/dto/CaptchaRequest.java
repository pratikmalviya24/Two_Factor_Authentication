package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;

public class CaptchaRequest {
    @NotBlank(message = "Captcha response cannot be blank")
    private String captchaResponse;

    public CaptchaRequest() {
    }

    public CaptchaRequest(String captchaResponse) {
        this.captchaResponse = captchaResponse;
    }

    public String getCaptchaResponse() {
        return captchaResponse;
    }

    public void setCaptchaResponse(String captchaResponse) {
        this.captchaResponse = captchaResponse;
    }
} 