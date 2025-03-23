package com.security.twofactorauth.dto;

import com.security.twofactorauth.model.TFAConfig.TFAType;

public class EnableTfaDTO {
    
    private boolean enabled;
    private String code;
    private TFAType tfaType;
    
    public EnableTfaDTO() {}
    
    public EnableTfaDTO(boolean enabled, String code, TFAType tfaType) {
        this.enabled = enabled;
        this.code = code;
        this.tfaType = tfaType;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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