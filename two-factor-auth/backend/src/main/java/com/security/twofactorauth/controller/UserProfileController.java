package com.security.twofactorauth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.security.twofactorauth.dto.TfaSettingDTO;
import com.security.twofactorauth.service.UserProfileService;

@RestController
@RequestMapping("/profile")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/tfa-settings")
    public ResponseEntity<TfaSettingDTO> getTfaSettings(Authentication authentication) {
        TfaSettingDTO settings = userProfileService.getTfaSettings(authentication.getName());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/tfa-settings")
    public ResponseEntity<TfaSettingDTO> updateTfaSettings(
            @RequestBody TfaSettingDTO settingsDTO,
            Authentication authentication) {
        TfaSettingDTO updatedSettings = userProfileService.updateTfaSettings(
                authentication.getName(),
                settingsDTO.isEnabled()
        );
        return ResponseEntity.ok(updatedSettings);
    }
}
