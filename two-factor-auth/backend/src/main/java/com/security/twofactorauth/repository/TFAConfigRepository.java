package com.security.twofactorauth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.security.twofactorauth.model.TFAConfig;
import com.security.twofactorauth.model.User;

@Repository
public interface TFAConfigRepository extends JpaRepository<TFAConfig, Long> {
    Optional<TFAConfig> findByUser(User user);
}
