package com.security.twofactorauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.security.twofactorauth.dto.TfaSettingDTO;
import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.UserRepository;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

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
}
