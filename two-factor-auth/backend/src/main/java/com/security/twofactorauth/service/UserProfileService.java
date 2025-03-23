package com.security.twofactorauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.security.twofactorauth.dto.TfaSettingDTO;
import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.TFAConfig.TFAType;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.TFAConfigRepository;
import com.security.twofactorauth.repository.UserRepository;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TwoFactorAuthService twoFactorAuthService;
    
    @Autowired
    private TFAConfigRepository tfaConfigRepository;

    @Transactional(readOnly = true)
    public TfaSettingDTO getTfaSettings(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new TfaSettingDTO(user.isTfaEnabled());
    }

    @Transactional
    public TfaSettingDTO updateTfaSettings(String username, boolean enabled) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setTfaEnabled(enabled);
        userRepository.save(user);
        
        return new TfaSettingDTO(user.isTfaEnabled());
    }
    
    @Transactional
    public TfaSettingDTO verifyAndEnableTfa(String username, String code, TFAType tfaType) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Ensure TFA config exists, if not create it
        TFAConfig config = user.getTfaConfig();
        if (config == null || config.getTfaType() != tfaType) {
            config = twoFactorAuthService.setupTwoFactorAuth(user, tfaType);
        }
        
        // Verify the provided code
        boolean isValid = twoFactorAuthService.verifyTwoFactorAuth(user, code);
        
        if (!isValid) {
            throw new RuntimeException("Invalid verification code");
        }
        
        // Enable TFA and save
        user.setTfaEnabled(true);
        userRepository.save(user);
        
        return new TfaSettingDTO(true);
    }
}
