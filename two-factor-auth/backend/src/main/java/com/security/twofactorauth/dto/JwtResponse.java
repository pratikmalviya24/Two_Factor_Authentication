package com.security.twofactorauth.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private boolean tfaEnabled;
    private boolean requiresTwoFactor;
    private String tfaSetupSecret;
    private String tfaType;

    public JwtResponse() {
    }

    private JwtResponse(String token, String type, Long id, String username, String email, boolean tfaEnabled, boolean requiresTwoFactor, String tfaSetupSecret, String tfaType) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
        this.tfaEnabled = tfaEnabled;
        this.requiresTwoFactor = requiresTwoFactor;
        this.tfaSetupSecret = tfaSetupSecret;
        this.tfaType = tfaType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public boolean isRequiresTwoFactor() {
        return requiresTwoFactor;
    }

    public void setRequiresTwoFactor(boolean requiresTwoFactor) {
        this.requiresTwoFactor = requiresTwoFactor;
    }

    public String getTfaSetupSecret() {
        return tfaSetupSecret;
    }

    public void setTfaSetupSecret(String tfaSetupSecret) {
        this.tfaSetupSecret = tfaSetupSecret;
    }

    public String getTfaType() {
        return tfaType;
    }

    public void setTfaType(String tfaType) {
        this.tfaType = tfaType;
    }

    public static JwtResponseBuilder builder() {
        return new JwtResponseBuilder();
    }

    public static class JwtResponseBuilder {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private boolean tfaEnabled;
        private boolean requiresTwoFactor;
        private String tfaSetupSecret;
        private String tfaType;

        JwtResponseBuilder() {
        }

        public JwtResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public JwtResponseBuilder type(String type) {
            this.type = type;
            return this;
        }

        public JwtResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public JwtResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public JwtResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public JwtResponseBuilder tfaEnabled(boolean tfaEnabled) {
            this.tfaEnabled = tfaEnabled;
            return this;
        }

        public JwtResponseBuilder requiresTwoFactor(boolean requiresTwoFactor) {
            this.requiresTwoFactor = requiresTwoFactor;
            return this;
        }

        public JwtResponseBuilder tfaSetupSecret(String tfaSetupSecret) {
            this.tfaSetupSecret = tfaSetupSecret;
            return this;
        }

        public JwtResponseBuilder tfaType(String tfaType) {
            this.tfaType = tfaType;
            return this;
        }

        public JwtResponse build() {
            return new JwtResponse(token, type, id, username, email, tfaEnabled, requiresTwoFactor, tfaSetupSecret, tfaType);
        }
    }
}
