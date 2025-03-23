package com.security.twofactorauth.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Service
public class CaptchaService {
    
    @Value("${google.recaptcha.verify-url}")
    private String recaptchaVerifyUrl;
    
    @Value("${google.recaptcha.secret}")
    private String recaptchaSecret;
    
    private final RestTemplate restTemplate;
    
    public CaptchaService() {
        this.restTemplate = new RestTemplate();
    }
    
    public boolean verifyCaptcha(String captchaResponse) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", recaptchaSecret);
        map.add("response", captchaResponse);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    recaptchaVerifyUrl, request, String.class);
            
            JsonObject jsonObject = new Gson().fromJson(response.getBody(), JsonObject.class);
            return jsonObject.get("success").getAsBoolean();
        } catch (Exception e) {
            return false;
        }
    }
} 