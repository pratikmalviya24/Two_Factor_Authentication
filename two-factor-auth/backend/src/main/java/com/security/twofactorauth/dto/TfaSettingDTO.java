package com.security.twofactorauth.dto;

public class TfaSettingDTO {
    private boolean enabled;

    public TfaSettingDTO() {}

    public TfaSettingDTO(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
