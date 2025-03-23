/**
 * Root package for all test classes in the Two-Factor Authentication application.
 * 
 * Test packages organization:
 * 
 * - com.security.twofactorauth.service: Service layer unit tests
 *   Contains tests for business logic, TFA operations, and email services
 * 
 * - com.security.twofactorauth.security: Security component tests
 *   Contains tests for JWT, authentication, and authorization
 * 
 * - com.security.twofactorauth.controller: Controller layer tests
 *   Contains tests for REST endpoints and request/response handling
 * 
 * - com.security.twofactorauth.integration: Integration tests
 *   Contains end-to-end flow tests combining multiple components
 * 
 * - com.security.twofactorauth.config: Test configurations
 *   Contains test-specific beans and configuration classes
 * 
 * - com.security.twofactorauth.util: Test utilities
 *   Contains helper classes for testing TOTP and other functionalities
 * 
 * Each package contains specialized test classes focusing on specific aspects
 * of the application. Integration tests combine multiple components to test
 * complete flows, while unit tests focus on individual components.
 */
package com.security.twofactorauth;
