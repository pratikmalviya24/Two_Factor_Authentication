package com.security.twofactorauth.dto;

import javax.validation.constraints.NotBlank;

import com.security.twofactorauth.model.TFAConfig.TFAType;

public class TwoFactorRequest {
    @NotBlank
    private String username;

    private String code;

    private TFAType tfaType;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public TFAType getTfaType() {
        return tfaType;
    }

    public void setTfaType(TFAType tfaType) {
        this.tfaType = tfaType;
    }
}
