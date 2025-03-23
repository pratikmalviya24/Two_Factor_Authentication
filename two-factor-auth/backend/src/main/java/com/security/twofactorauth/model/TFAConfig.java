package com.security.twofactorauth.model;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Entity for storing Two-Factor Authentication configuration
 */
@Entity
@Table(name = "tfa_config", uniqueConstraints = {
    @javax.persistence.UniqueConstraint(columnNames = "user_id")
})
public class TFAConfig implements Serializable {
    
    private static final long serialVersionUID = 1L;

    /** Types of Two-Factor Authentication */
    public enum TFAType {
        /** Authenticator app-based 2FA */
        APP,
        /** Email-based 2FA */
        EMAIL
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User must be set")
    private User user;

    @Column(nullable = false)
    @NotNull(message = "Secret key must be set")
    private String secretKey;

    @Column(name = "qr_code_uri", length = 1000)
    private String qrCodeUri;

    @Column(name = "temporary_code")
    private String temporaryCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "TFA type must be set")
    private TFAType tfaType;

    // JPA requires a no-args constructor
    public TFAConfig() {}

    /**
     * Constructor for basic configuration
     */
    public TFAConfig(User user, String secretKey, TFAType tfaType) {
        validateParams(user, secretKey, tfaType);
        this.user = user;
        this.secretKey = secretKey;
        this.tfaType = tfaType;
    }

    private void validateParams(User user, String secretKey, TFAType tfaType) {
        if (user == null) throw new IllegalArgumentException("User must not be null");
        if (secretKey == null) throw new IllegalArgumentException("Secret key must not be null");
        if (tfaType == null) throw new IllegalArgumentException("TFA type must not be null");
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getSecretKey() { return secretKey; }
    public String getTemporaryCode() { return temporaryCode; }
    public TFAType getTfaType() { return tfaType; }
    public String getQrCodeUri() { return qrCodeUri; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public void setTemporaryCode(String temporaryCode) { this.temporaryCode = temporaryCode; }
    public void setTfaType(TFAType tfaType) { this.tfaType = tfaType; }
    public void setQrCodeUri(String qrCodeUri) { this.qrCodeUri = qrCodeUri; }

    /**
     * Factory method to create a new app-based TFA configuration
     */
    public static TFAConfig createAppConfig(User user, String secretKey) {
        return new TFAConfig(user, secretKey, TFAType.APP);
    }

    /**
     * Factory method to create a new email-based TFA configuration
     */
    public static TFAConfig createEmailConfig(User user, String secretKey, String temporaryCode) {
        TFAConfig config = new TFAConfig(user, secretKey, TFAType.EMAIL);
        config.setTemporaryCode(temporaryCode);
        return config;
    }

    /**
     * Returns a new instance with the temporary code cleared
     */
    public TFAConfig withoutTemporaryCode() {
        TFAConfig config = new TFAConfig(this.getUser(), this.getSecretKey(), this.getTfaType());
        config.setId(this.getId());
        return config;
    }

    /**
     * Returns a new instance with the given temporary code
     */
    public TFAConfig withTemporaryCode(String code) {
        TFAConfig config = new TFAConfig(this.getUser(), this.getSecretKey(), this.getTfaType());
        config.setId(this.getId());
        config.setTemporaryCode(code);
        return config;
    }

    /**
     * Creates a test instance for unit testing
     */
    public static TFAConfig forTesting(Long id, User user, String secretKey, TFAType tfaType, String temporaryCode) {
        TFAConfig config = new TFAConfig(user, secretKey, tfaType);
        config.setId(id);
        if (temporaryCode != null) {
            config.setTemporaryCode(temporaryCode);
        }
        return config;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TFAConfig)) return false;
        TFAConfig that = (TFAConfig) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(user, that.user) &&
               Objects.equals(secretKey, that.secretKey) &&
               tfaType == that.tfaType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user, secretKey, tfaType);
    }

    @Override
    public String toString() {
        return "TFAConfig{" +
               "id=" + id +
               ", user=" + user +
               ", secretKey='[PROTECTED]'" +
               ", tfaType=" + tfaType +
               '}';
    }
}
