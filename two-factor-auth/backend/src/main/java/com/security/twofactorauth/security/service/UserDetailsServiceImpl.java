package com.security.twofactorauth.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.security.twofactorauth.model.User;
import com.security.twofactorauth.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Try to find by username first
        User user = userRepository.findByUsername(login)
                .orElseGet(() -> {
                    // If not found by username, try email
                    return userRepository.findByEmail(login)
                            .orElseThrow(() -> new UsernameNotFoundException(
                                    "User not found with username/email: " + login));
                });

        return UserDetailsImpl.build(user);
    }
}
