/**
 * Integration test package.
 * 
 * This package contains end-to-end integration tests:
 * 
 * 1. AuthFlowIntegrationTest:
 *    - Complete authentication flow testing
 *    - User registration
 *    - Login process
 *    - 2FA setup and verification
 *    - Token management
 * 
 * 2. EmailTwoFactorAuthTest:
 *    - Email-based 2FA integration
 *    - Email verification flow
 *    - Code generation and validation
 *    - Mail server integration
 * 
 * Key Integration Points Tested:
 * - Database interactions
 * - Email service integration
 * - Security filters
 * - Authentication flow
 * - Token processing
 * - HTTP request/response cycle
 * 
 * Test Environment:
 * - Uses H2 in-memory database
 * - Mock SMTP server
 * - Spring Security test context
 * - MockMvc for HTTP simulation
 * 
 * These tests verify that all components work
 * together correctly in a production-like environment.
 */
package com.security.twofactorauth.integration;
