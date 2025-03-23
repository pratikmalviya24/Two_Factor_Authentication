package com.security.twofactorauth;

import org.junit.platform.suite.api.IncludePackages;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

/**
 * Test Suite for Two-Factor Authentication Application
 * 
 * This suite includes all tests for the application.
 * The tests are organized by package:
 * 
 * 1. Unit Tests:
 *    - com.security.twofactorauth.service: Service layer tests
 *    - com.security.twofactorauth.security: Security component tests
 *    - com.security.twofactorauth.controller: Controller layer tests
 * 
 * 2. Integration Tests:
 *    - com.security.twofactorauth.integration: Complete flow tests
 * 
 * 3. Configuration Tests:
 *    - com.security.twofactorauth: Application context tests
 * 
 * Test Coverage:
 * - Authentication flows (with and without 2FA)
 * - Token generation and validation
 * - Security configurations
 * - Email functionality
 * - TOTP generation and validation
 * - Protected endpoint access
 * - Error handling
 * - Database operations
 * - Mail server configuration
 * 
 * To run the entire test suite:
 * mvn test
 * 
 * To run specific test packages:
 * mvn test -Dtest="com.security.twofactorauth.service.*Test"
 * 
 * Test Environment:
 * - Uses H2 in-memory database
 * - Mock mail server
 * - Test-specific security configuration
 * - Shortened JWT expiration times
 */
@Suite
@SelectPackages({
    "com.security.twofactorauth.service",
    "com.security.twofactorauth.security",
    "com.security.twofactorauth.controller",
    "com.security.twofactorauth.integration"
})
@IncludePackages({
    "com.security.twofactorauth.service",
    "com.security.twofactorauth.security",
    "com.security.twofactorauth.controller",
    "com.security.twofactorauth.integration"
})
public class TestSuite {
    // Suite configuration placeholder
}
