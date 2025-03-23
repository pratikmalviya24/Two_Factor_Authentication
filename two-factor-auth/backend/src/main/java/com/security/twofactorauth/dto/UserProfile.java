package com.security.twofactorauth.dto;

public class UserProfile {
    private Long id;
    private String username;
    private String email;
    private boolean tfaEnabled;

    public UserProfile(Long id, String username, String email, boolean tfaEnabled) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.tfaEnabled = tfaEnabled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public boolean isTfaEnabled() {
        return tfaEnabled;
    }

    public void setTfaEnabled(boolean tfaEnabled) {
        this.tfaEnabled = tfaEnabled;
    }
}
