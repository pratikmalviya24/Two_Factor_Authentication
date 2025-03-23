/**
 * Test utilities package.
 * 
 * This package contains utility classes to support testing:
 * 
 * 1. TOTPTestUtil:
 *    - TOTP code generation for testing
 *    - Secret key generation
 *    - Code verification
 *    - Time window handling
 * 
 * Key Features:
 * - Deterministic code generation for testing
 * - Test-specific configuration
 *   - Fixed time windows
 *   - Controlled secret keys
 *   - Predictable outputs
 * 
 * Usage:
 * - Generate test TOTP codes
 * - Verify TOTP codes in tests
 * - Create test secret keys
 * - Simulate time-based code generation
 * 
 * Implementation Details:
 * - Uses Google Authenticator library
 * - Configurable time steps
 * - Customizable validation windows
 * - Thread-safe implementation
 * 
 * These utilities ensure consistent and reliable
 * testing of two-factor authentication functionality
 * across the application.
 */
package com.security.twofactorauth.util;
