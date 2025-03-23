/**
 * Service layer test package.
 * 
 * This package contains tests for business logic components:
 * 
 * 1. TwoFactorAuthServiceTest:
 *    - TOTP code generation and validation
 *    - Secret key management
 *    - QR code generation
 *    - Email verification code handling
 * 
 * 2. Service Configurations:
 *    - TwoFactorAuthServiceTestConfig
 *    - Test-specific service beans
 *    - Mock configurations
 * 
 * Key test coverage:
 * - App-based 2FA (TOTP)
 *   - Code generation
 *   - Code validation
 *   - Time window handling
 * 
 * - Email-based 2FA
 *   - Code generation
 *   - Email sending
 *   - Code validation
 * 
 * - Configuration Tests
 *   - Secret key generation
 *   - QR code URI generation
 *   - Validation windows
 *   - Error scenarios
 * 
 * All tests use mocked dependencies where appropriate
 * and follow the AAA (Arrange-Act-Assert) pattern.
 */
package com.security.twofactorauth.service;
